// Adds expect(element).toBeAccessible(), an axe-core audit of the rendered DOM.
import { registerSa11yMatcher } from '@sa11y/jest';

registerSa11yMatcher();
