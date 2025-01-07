import { Link } from "wouter";

export default function Page() {
    return (
        <div className="w-[80ch] mx-auto">
            <h1 className="text-3xl font-black text-lime-600">Us</h1>
            <br />

            <p>The original hindsight project is made by <span className="font-bold">haggen</span></p>
            <p>His twitter: <a href="https://x.com/haggen" target="_blank" className="underline">x.com/haggen</a></p>
            <p>His Github account: <a href="https://github.com/haggen/" className="underline">github.com/haggen</a></p>

            <br />
            <p>Now I, <span className="font-bold">João</span>, have made a fork of the project, and am hosting what are you seeing!</p>
            
            <p>My Github account: <a href="https://github.com/Joao620/" className="underline">github.com/Joao620</a></p>
            <p>My blog (in Portuguese): <a href="https://weblog.hagaka.me/" className="underline">weblog.hagaka.me</a></p>

            <br />
            <p>So, if you want do say something, send <span className="font-bold">me</span> an email at: <a href="mailto:hi@https://hindsight-for.team/" className="underline">hi@hindsight-for.team</a></p>

            <br />
            <p>And, if you want to see the source code of this fork, it's on <a href="https://github.com/Joao620/hindsight-frontend" className="underline">github.com/Joao620/hindsight-frontend</a></p>
            <p>And the backend is on <a href="https://github.com/Joao620/hindsight-backend" className="underline">github.com/Joao620/hindsight-backend</a></p>

            <br />
            <p className="font-black">Now, back to the <Link href="~/" className="underline text-lime-600">home page</Link></p>
        </div>
    );
}