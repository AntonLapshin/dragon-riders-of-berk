import { Showcase } from "./ui/components/Showcase";

/**
 * App root.
 *
 * Renders the showcase gallery. The gallery is a thin view: all decisions live
 * in `src/core` and are bound to the component tree by the `useShowcase` view
 * model. No business logic lives here.
 */
export default function App() {
  return <Showcase />;
}
