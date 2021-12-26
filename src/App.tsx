import './App.css';
import Dapp from './pages/Dapp';

export default function App() {

  return (
    <div className="App">
      <h1>BSC Gnosis Multisig Recovery</h1>
      <header>
        If you used the old Gnosis Safe hosted by Binance (https://gnosis-safe.binance.org/), you've seen it is no
        longer supported. Hopefully you were able to transfer your assets away before it stopped working. If not or if
        you had some vested tokens arriving in that address, this tool will help you to retrieve them. 
        <br /><br />
        Firstly, you need to build up enough signatures depending on what your threshold is using the "Sign" tab. 
        <br /><br />
        Then, you need to assemble these signatures and send them to the blockchain using the "Send" tab.
      </header>

     <Dapp />

      <footer>
        --
        <br /><br />
        <p className="bold">Why does this website look like shit? How can I trust it?</p>
        <br />
        It takes inspiration from the <a href="https://motherfuckingwebsite.com/" target="_blank">Mother Fucking Website</a> and my laziness. Didn't the website load super fast? Nice, right? It's also primarily a developer tool. If you're not sure you can trust it, <a href="https://github.com/devanonon/binance-gnosis-recover" target="_blank">verify the source code.</a> Also, feel free to make a nicer UI ¯\_(ツ)_/¯.
        <br /><br />
        <p className="bold">Why build it?</p>
        <br />
        We had this issue at <a href="https://chainstride.capital/" target="_blank">Chainstride Capital</a> and needed a simple tool to retreive some vested tokens from our old BSC multisig. I thought I'd polish it (slightly) and share it with the world.
        <br /><br />
        <p className="small">This tool is not responsible for any erroneous transactions which may occur. This tool merely aids developers in
        building and propagating Gnosis Multisig ERC20 transactions.</p>
      </footer>
    </div>
  );
}
