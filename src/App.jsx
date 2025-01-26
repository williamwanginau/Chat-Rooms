import { toast } from "react-toastify";

const notify = () => toast("Wow so easy !");

function App() {
  return (
    <div className="grid place-items-center h-dvh bg-zinc-900/15">
      <button onClick={notify}>Notify !</button>
    </div>
  );
}

export default App;
