import { Button } from "~/components/Button";
import { Icon } from "~/components/Icon";

// type Props = {
//   params: { boardId: string };
// };

export default function Page() {
  return (
    <div className="flex flex-col gap-3 items-center justify-center text-center h-full bg-stone-100 rounded">
      <h2 className="text-3xl font-black">All done.</h2>
      <p>Congratulations on finishing another cycle!</p>
      <Button href='/'>Go back to the board <Icon symbol="table"/></Button>
    </div>
  );
}
