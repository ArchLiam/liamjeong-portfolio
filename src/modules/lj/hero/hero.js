import { LightningElement } from 'lwc';
import { gsap } from 'gsap';
import { analytics, profile, schema, ui, NODE_WIDTH } from 'lj/content';
import { track } from 'lj/analytics';
import { icons, ICON_GRID } from 'lj/icons';

// site.css reveals the intro elements at 4.5s if this script never runs. When
// hydration lands after that, the visitor has already seen the finished
// diagram, so it is shown as is instead of being replayed.
const CSS_FALLBACK_MS = 4500;

// Card anatomy, in card coordinates: the icon chip and label form a header,
// a rule sits under it, then one item per row, like Schema Builder fields.
const CHIP = { x: 14, y: 16, size: 26 };
const ICON_SIZE = 16;
const HEADER = 72;
const ROW = 17;
const PAD_BOTTOM = 9;
// Same-row connectors run level with the label, whatever each card's height
const SIDE_Y = 44;

// Grid: three columns across the drawing; rows stack with a fixed gap and
// take the height of their tallest card.
const VIEW_WIDTH = 560;
const MARGIN = 16;
const COL_X = [10, 204, 398];
const ROW_GAP = 48;

// Pulse waves: deploys into the hub, the hub out to every card, data moving
// between outer cards, and last, the pulse that lands on the focus card.
const WAVE_STARTS = [1.95, 2.3, 2.65, 3.0];
const FOCUS_AT = WAVE_STARTS[3] + 0.6;

const heightOf = (node) => HEADER + node.items.length * ROW + PAD_BOTTOM;

const rowCount = Math.max(...schema.nodes.map((node) => node.row)) + 1;
const rowHeights = Array.from({ length: rowCount }, (_, row) =>
    Math.max(
        0,
        ...schema.nodes.filter((node) => node.row === row).map(heightOf)
    )
);
const rowTops = [];
rowHeights.forEach((height, row) => {
    rowTops.push(
        row === 0 ? MARGIN : rowTops[row - 1] + rowHeights[row - 1] + ROW_GAP
    );
});
const VIEW_HEIGHT = rowTops[rowCount - 1] + rowHeights[rowCount - 1] + MARGIN;

const placed = schema.nodes.map((node) => ({
    ...node,
    x: COL_X[node.col],
    y: rowTops[node.row],
    height: heightOf(node)
}));
const byId = new Map(placed.map((node) => [node.id, node]));

const box = (node) => ({
    left: node.x,
    right: node.x + NODE_WIDTH,
    top: node.y,
    bottom: node.y + node.height,
    cx: node.x + NODE_WIDTH / 2,
    cy: node.y + node.height / 2
});

// Where several connectors meet the same side of a card, their ports spread
// out this far apart, so no two lines share a point and read as a junction.
const PORT_SPREAD = 52;

const sideFacing = (node, other) => {
    if (node.row === other.row) {
        return other.x > node.x ? 'right' : 'left';
    }
    return other.y > node.y ? 'bottom' : 'top';
};

// Port positions for both ends of every edge, spread along each card side in
// the order of where their lines head, so lines leaving one side never cross.
const portsByEdge = schema.edges.map(() => ({}));
const sides = new Map();
schema.edges.forEach(([fromId, toId], i) => {
    [
        ['start', byId.get(fromId), byId.get(toId)],
        ['end', byId.get(toId), byId.get(fromId)]
    ].forEach(([end, node, other]) => {
        const side = sideFacing(node, other);
        const key = `${node.id}:${side}`;
        if (!sides.has(key)) {
            sides.set(key, []);
        }
        sides.get(key).push({ i, end, node, other, side });
    });
});
sides.forEach((group) => {
    const vertical = group[0].side === 'top' || group[0].side === 'bottom';
    const along = (entry) => (vertical ? box(entry.other).cx : entry.other.y);
    group.sort((a, b) => along(a) - along(b));
    group.forEach(({ i, end, node, side }, k) => {
        const b = box(node);
        const shift = (k - (group.length - 1) / 2) * PORT_SPREAD;
        portsByEdge[i][end] = vertical
            ? { x: b.cx + shift, y: side === 'top' ? b.top : b.bottom }
            : {
                  x: side === 'left' ? b.left : b.right,
                  y: node.y + SIDE_Y + shift
              };
    });
});

/**
 * A connector between two ports, written as a cubic Bezier
 * ("M x0 y0 C x1 y1, x2 y2, x3 y3"). Cards in the same row join side to side
 * with a straight line, level with their labels; cards in different rows join
 * top to bottom with an S-curve.
 */
const connectorPath = (start, end, sameRow) => {
    if (sameRow) {
        return `M ${start.x} ${start.y} C ${start.x} ${start.y}, ${end.x} ${end.y}, ${end.x} ${end.y}`;
    }
    const midY = (start.y + end.y) / 2;
    return `M ${start.x} ${start.y} C ${start.x} ${midY}, ${end.x} ${midY}, ${end.x} ${end.y}`;
};

const waveOf = (from, to) => {
    if (to.hub) {
        return 0;
    }
    if (from.hub) {
        return 1;
    }
    return to.focus ? 3 : 2;
};

const connectors = schema.edges.map(([fromId, toId], i) => {
    const from = byId.get(fromId);
    const to = byId.get(toId);
    const { start, end } = portsByEdge[i];
    return {
        id: `${fromId}-${toId}`,
        fromId,
        toId,
        wave: waveOf(from, to),
        start,
        end,
        d: connectorPath(start, end, from.row === to.row)
    };
});

// The hub renders last so the other cards can fly out from underneath it
const ORDERED = [...placed].sort(
    (a, b) => Number(Boolean(a.hub)) - Number(Boolean(b.hub))
);
const FOCUS_ID = (placed.find((node) => node.focus) || placed[0]).id;

// Who each card connects to, in edge order, for highlighting and the caption
const neighbours = new Map(placed.map((node) => [node.id, []]));
schema.edges.forEach(([fromId, toId]) => {
    neighbours.get(fromId).push(toId);
    neighbours.get(toId).push(fromId);
});
const touches = (connector, id) =>
    connector.fromId === id || connector.toId === id;

const prefersReducedMotion = () =>
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// jsdom has no getTotalLength, so tests get a stand-in length
function lengthOf(path) {
    return typeof path.getTotalLength === 'function'
        ? path.getTotalLength()
        : 600;
}

/**
 * @description Hero: logo lockup, positioning line, and an architecture
 * diagram that assembles itself once on load: cards fly out of the platform
 * core, connectors draw, and data pulses travel along them in waves (deploy,
 * platform, data), ending with Data 360 grounding Agentforce, where the
 * amber focus dot lands. This is the page's single orchestrated motion
 * moment, and it finishes in under five seconds, so it needs no pause control
 * (WCAG 2.2.2).
 *
 * SSR notes: this component renders on the server (bootstrap.ssr), so
 * nothing touches window/document outside renderedCallback, which only
 * runs in the browser.
 * @author Liam Jeong
 */
export default class Hero extends LightningElement {
    static renderMode = 'light';

    profile = profile;
    ui = ui;
    analytics = analytics;
    diagramTitle = schema.title;
    diagramDescription = schema.description;
    viewBox = `0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`;
    viewWidth = VIEW_WIDTH;
    viewHeight = VIEW_HEIGHT;
    nodeWidth = NODE_WIDTH;
    chip = CHIP;
    ruleY = HEADER - 2;
    // Centres the 16px icon inside the chip
    iconTransform = `translate(${CHIP.x + (CHIP.size - ICON_SIZE) / 2} ${
        CHIP.y + (CHIP.size - ICON_SIZE) / 2
    }) scale(${ICON_SIZE / ICON_GRID})`;
    // The amber dot sits in the top-right corner, level with the icon chip
    signalX = NODE_WIDTH - 20;
    signalY = CHIP.y + CHIP.size / 2;

    ringWidth = NODE_WIDTH + 12;
    hintIconViewBox = `0 0 ${ICON_GRID} ${ICON_GRID}`;
    hintIconPaths = icons.touch_action.map((d, i) => ({
        key: `hint-icon-${i}`,
        d
    }));

    // The selected card carries the amber highlight. It starts on the
    // schema's focus card, where the intro lands.
    selectedId = FOCUS_ID;
    // True after the first selection: from then on the connectors trace it
    explored = false;

    get nodes() {
        const linked = new Set(neighbours.get(this.selectedId));
        return ORDERED.map((node) => {
            const selected = node.id === this.selectedId;
            let className = 'schema-node';
            if (selected) {
                className += ' schema-node_focus';
            } else if (this.explored && linked.has(node.id)) {
                className += ' schema-node_linked';
            }
            return {
                ...node,
                transform: `translate(${node.x} ${node.y})`,
                className,
                selected,
                pressed: selected ? 'true' : 'false',
                ariaLabel: `${node.label}: ${node.items.join(', ')}`,
                ringHeight: node.height + 12,
                hubAttr: node.hub ? 'true' : null,
                iconPaths: (icons[node.icon] || []).map((d, i) => ({
                    key: `${node.id}-icon-${i}`,
                    d
                })),
                rows: node.items.map((label, i) => ({
                    key: `${node.id}-item-${i}`,
                    label,
                    y: HEADER + 13 + i * ROW
                }))
            };
        });
    }

    get edges() {
        return connectors.map((connector) => {
            let className = 'schema-edge';
            if (this.explored) {
                className += touches(connector, this.selectedId)
                    ? ' schema-edge_active'
                    : ' schema-edge_dim';
            }
            return {
                id: connector.id,
                d: connector.d,
                pulseKey: `${connector.id}-pulse`,
                className
            };
        });
    }

    // A small port where each connector meets a card, as in Schema Builder
    get ports() {
        return connectors.flatMap((connector) => {
            let className = 'schema-port';
            if (this.explored) {
                className += touches(connector, this.selectedId)
                    ? ' schema-port_active'
                    : ' schema-port_dim';
            }
            const { id, start, end } = connector;
            return [
                { key: `${id}-start`, cx: start.x, cy: start.y, className },
                { key: `${id}-end`, cx: end.x, cy: end.y, className }
            ];
        });
    }

    // Under the diagram: the tap hint, then the selected card's name and
    // summary. It is a polite live region, so screen readers hear it too.
    get selectedNode() {
        return byId.get(this.selectedId);
    }

    _introStarted = false;
    _timeline;
    _traceTimeline;
    _pendingTrace = false;

    renderedCallback() {
        if (!this._introStarted) {
            this._introStarted = true;
            this.playIntro();
            return;
        }
        // A new selection has rendered: animate onto it
        if (this._pendingTrace) {
            this._pendingTrace = false;
            this.traceSelection();
        }
    }

    disconnectedCallback() {
        // Finish before killing: the run-once guard won't replay the intro,
        // so a hero removed mid-animation and reinserted must not stay half-faded.
        [this._timeline, this._traceTimeline].forEach((tl) => {
            if (tl) {
                tl.progress(1).kill();
            }
        });
        this._timeline = undefined;
        this._traceTimeline = undefined;
    }

    handleCardClick(event) {
        this.select(event.currentTarget.dataset.id);
    }

    handleCardKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            // Space would otherwise scroll the page
            event.preventDefault();
            this.select(event.currentTarget.dataset.id);
        }
    }

    select(id) {
        // Only clicks and Enter/Space call this, so every count is a person
        const node = schema.nodes.find((item) => item.id === id);
        if (node) {
            track(analytics.diagramCard, { card: node.label });
        }
        // A selection during the intro jumps the intro to its end first
        if (this._timeline && this._timeline.progress() < 1) {
            this._timeline.progress(1);
        }
        const changed = id !== this.selectedId || !this.explored;
        this.selectedId = id;
        this.explored = true;
        if (changed) {
            // Wait for the re-render, which moves the amber dot to this card
            this._pendingTrace = true;
        } else {
            this.traceSelection();
        }
    }

    /**
     * Lands the amber dot on the selected card with a ripple, and sends a
     * pulse along each of its connectors. Skipped for reduced motion: the
     * highlight still moves, just without the animation.
     */
    traceSelection() {
        const diagram = this.refs && this.refs.diagram;
        if (!diagram || prefersReducedMotion()) {
            return;
        }
        const card = diagram.querySelector(`[data-id="${this.selectedId}"]`);
        const dot = card && card.querySelector('[data-focus]');
        const ripple = card && card.querySelector('[data-ripple]');
        const pulses = [...diagram.querySelectorAll('[data-pulse]')];

        if (this._traceTimeline) {
            this._traceTimeline.progress(1).kill();
        }
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        if (dot) {
            tl.fromTo(
                dot,
                { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' },
                { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.2)' },
                0
            );
        }
        if (ripple) {
            tl.fromTo(
                ripple,
                { opacity: 0.6, scale: 1, transformOrigin: '50% 50%' },
                {
                    opacity: 0,
                    scale: 3.6,
                    duration: 0.9,
                    ease: 'power2.out',
                    immediateRender: false
                },
                0.05
            );
        }
        let sent = 0;
        connectors.forEach((connector, i) => {
            if (touches(connector, this.selectedId) && pulses[i]) {
                this.addPulse(tl, pulses[i], 0.1 + sent * 0.05);
                sent += 1;
            }
        });
        this._traceTimeline = tl;
    }

    playIntro() {
        const diagram = this.refs && this.refs.diagram;
        const copy = this.refs && this.refs.copy;
        if (!diagram || !copy) {
            return;
        }

        const all = (selector) => [...diagram.querySelectorAll(selector)];
        const copyLines = [...copy.querySelectorAll('[data-intro]')];
        const grid = all('[data-grid]');
        const nodes = all('[data-node]');
        const hub = nodes.filter((node) => node.hasAttribute('data-hub'));
        const outer = nodes.filter((node) => !node.hasAttribute('data-hub'));
        const edges = all('[data-edge]');
        const ports = all('[data-port]');
        const pulses = all('[data-pulse]');
        const focus = diagram.querySelector('[data-focus]');
        const ripple = diagram.querySelector('[data-ripple]');
        // The hint sits under the drawing, outside the SVG
        const hint = [...this.querySelectorAll('[data-hint]')];
        const revealed = [
            ...copyLines,
            ...grid,
            ...nodes,
            ...edges,
            ...ports,
            ...hint
        ];
        if (focus) {
            revealed.push(focus);
        }

        const reduceMotion = prefersReducedMotion();
        const hydratedLate = performance.now() > CSS_FALLBACK_MS - 500;

        if (reduceMotion || hydratedLate) {
            gsap.set(revealed, { opacity: 1, clearProps: 'transform' });
            return;
        }

        // The script is running, so the CSS fallback must not cut in mid-intro
        gsap.set(revealed, { animation: 'none' });

        // Prepare each connector so it can be "drawn" by animating the dash offset.
        edges.forEach((edge) => {
            const length = lengthOf(edge);
            gsap.set(edge, {
                opacity: 1,
                strokeDasharray: length,
                strokeDashoffset: length
            });
        });

        // Outer cards start stacked on the hub and fly out to their places
        const hubNode = this.nodes.find((node) => node.hub);
        const outerNodes = this.nodes.filter((node) => !node.hub);
        const offset = (i, axis) => {
            return hubNode ? hubNode[axis] - outerNodes[i][axis] : 0;
        };

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(
            copyLines,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 },
            0
        )
            .fromTo(
                grid,
                { opacity: 0 },
                { opacity: 1, duration: 0.8, ease: 'power1.out' },
                0.2
            )
            .fromTo(
                hub,
                { opacity: 0, scale: 0.85, transformOrigin: '50% 50%' },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
                0.45
            )
            .fromTo(
                outer,
                {
                    opacity: 0,
                    scale: 0.6,
                    x: (i) => offset(i, 'x'),
                    y: (i) => offset(i, 'y'),
                    transformOrigin: '50% 50%'
                },
                {
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                    duration: 0.9,
                    ease: 'expo.out',
                    stagger: 0.06
                },
                0.75
            )
            .to(
                edges,
                {
                    strokeDashoffset: 0,
                    duration: 0.6,
                    ease: 'power2.inOut',
                    stagger: 0.05
                },
                1.4
            )
            .fromTo(
                ports,
                { opacity: 0, scale: 0, transformOrigin: '50% 50%' },
                { opacity: 1, scale: 1, duration: 0.3, stagger: 0.02 },
                1.7
            );

        // Data pulses in waves, a little staggered within each wave
        const seenInWave = [0, 0, 0, 0];
        pulses.forEach((pulse, i) => {
            const { wave } = connectors[i];
            const at = WAVE_STARTS[wave] + seenInWave[wave] * 0.04;
            seenInWave[wave] += 1;
            this.addPulse(tl, pulse, at);
        });

        if (focus) {
            tl.fromTo(
                focus,
                { opacity: 0, scale: 0.4, transformOrigin: '50% 50%' },
                { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2.2)' },
                FOCUS_AT
            );
        }
        if (ripple) {
            tl.fromTo(
                ripple,
                { opacity: 0.6, scale: 1, transformOrigin: '50% 50%' },
                {
                    opacity: 0,
                    scale: 3.6,
                    duration: 0.9,
                    ease: 'power2.out',
                    // Its start state is visible, so don't apply it before its turn
                    immediateRender: false
                },
                FOCUS_AT + 0.05
            );
        }

        // Last, the tap hint, so the finished diagram invites a click
        tl.fromTo(
            hint,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power1.out' },
            FOCUS_AT + 0.3
        );

        this._timeline = tl;
    }

    /**
     * Sends one short glowing dash along a connector, start to end, by sliding
     * a single dash (gap longer than the path) past the visible length.
     */
    addPulse(tl, pulse, at) {
        const length = lengthOf(pulse);
        const dash = Math.min(28, length * 0.4);
        tl.fromTo(
            pulse,
            {
                opacity: 1,
                strokeDasharray: `${dash} ${length + dash}`,
                strokeDashoffset: dash
            },
            {
                strokeDashoffset: -length,
                duration: 0.7,
                ease: 'power1.inOut',
                // Stay hidden until this pulse's turn; a round cap would show early
                immediateRender: false
            },
            at
        ).set(pulse, { opacity: 0 }, at + 0.7);
    }
}
