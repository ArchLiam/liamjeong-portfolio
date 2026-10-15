import { LightningElement } from 'lwc';
import { gsap } from 'gsap';
import { profile, schema, ui, NODE_WIDTH, NODE_HEIGHT } from 'lj/content';

const byId = new Map(schema.nodes.map((node) => [node.id, node]));
const center = (node) => ({
    x: node.x + NODE_WIDTH / 2,
    y: node.y + NODE_HEIGHT / 2
});

/**
 * @description Hero: name, positioning line, and an architecture diagram that
 * draws itself once on load. This is the page's single orchestrated motion moment.
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
    diagramTitle = schema.title;
    diagramDescription = schema.description;
    nodeWidth = NODE_WIDTH;
    nodeHeight = NODE_HEIGHT;

    nodes = schema.nodes.map((node) => ({
        ...node,
        transform: `translate(${node.x} ${node.y})`,
        className: node.focus ? 'schema-node schema-node_focus' : 'schema-node'
    }));

    edges = schema.edges.map(([fromId, toId]) => {
        const a = center(byId.get(fromId));
        const b = center(byId.get(toId));
        const midY = (a.y + b.y) / 2;
        return {
            id: `${fromId}-${toId}`,
            d: `M ${a.x} ${a.y} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${b.y}`
        };
    });

    _introStarted = false;
    _timeline;

    renderedCallback() {
        if (this._introStarted) {
            return;
        }
        this._introStarted = true;
        this.playIntro();
    }

    disconnectedCallback() {
        if (this._timeline) {
            // Finish before killing: the run-once guard won't replay the intro,
            // so a hero removed mid-animation and reinserted must not stay half-faded.
            this._timeline.progress(1).kill();
            this._timeline = undefined;
        }
    }

    playIntro() {
        const diagram = this.refs && this.refs.diagram;
        const copy = this.refs && this.refs.copy;
        if (!diagram || !copy) {
            return;
        }

        const nodes = diagram.querySelectorAll('[data-node]');
        const edges = diagram.querySelectorAll('[data-edge]');
        const focus = diagram.querySelector('[data-focus]');
        const copyLines = copy.querySelectorAll('[data-intro]');

        const reduceMotion =
            typeof window.matchMedia === 'function' &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (reduceMotion) {
            gsap.set([...copyLines, ...nodes, ...edges], {
                opacity: 1,
                clearProps: 'transform'
            });
            return;
        }

        // Prepare each connector so it can be "drawn" by animating the dash offset.
        edges.forEach((edge) => {
            const length =
                typeof edge.getTotalLength === 'function'
                    ? edge.getTotalLength()
                    : 600;
            gsap.set(edge, {
                opacity: 1,
                strokeDasharray: length,
                strokeDashoffset: length
            });
        });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

        tl.fromTo(
            copyLines,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.12 }
        )
            .fromTo(
                nodes,
                { opacity: 0, scale: 0.92, transformOrigin: '50% 50%' },
                { opacity: 1, scale: 1, duration: 0.5, stagger: 0.07 },
                '-=0.45'
            )
            .to(
                edges,
                {
                    strokeDashoffset: 0,
                    duration: 0.9,
                    stagger: 0.06,
                    ease: 'power2.inOut'
                },
                '-=0.25'
            );

        if (focus) {
            tl.fromTo(
                focus,
                { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' },
                { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' },
                '-=0.2'
            );
        }

        this._timeline = tl;
    }
}
