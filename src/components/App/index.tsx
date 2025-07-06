import { useEffect } from "react";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { HTTP_PROTOCOL, SERVER_URL } from "~/contants";
import Missing from "~/pages/404";
import Card from "~/pages/Card";
import Finished from "~/pages/Finished";
import Welcome from "~/pages/Welcome";
import { Board } from "../Board";
import Boards from "~/pages/Boards";
import dale from "~/pages/Board";
import UsPage from "~/pages/Us";

export function App() {
  useEffect(() => {
    fetch(`${HTTP_PROTOCOL}://${SERVER_URL}/wake-up`);
    console.log("Waking up the server.");
  }, []);
  
  return (
    <div className="mx-auto min-w-[64rem]">
      <Router hook={useHashLocation}>
        <Switch>
          <Route path="/" component={Welcome} />
          <Route path="/boards" component={Boards} />
          <Route path="/boards/:boardId" nest >
            <Board>
              <Switch>
                <Route path="/" component={dale} />
                <Route path="/cards/:cardId" component={Card} />
                <Route path="/finished" component={Finished} />
              </Switch>
            </Board>
          </Route>
          <Route path="~/us" component={UsPage} />
          <Route component={Missing} />
        </Switch>
      </Router>
    </div>
  );
}
