import { ReactNode } from "react";

import * as classes from "./style.module.css";

import { Reaction } from "~/src/components/Reaction";
import { Display } from "~/src/components/Display";
import { Button } from "~/src/components/Button";
import { Flex } from "~/src/components/Flex";
import { useAwareness, usePresentation, useTimer } from "~/src/lib/data";
import { pluralize } from "~/src/lib/pluralize";

function Pagination() {
  const presentation = usePresentation();

  const handleNext = () => {
    presentation.next();
  };

  const handleBack = () => {
    presentation.prev();
  };

  if (!presentation.active) {
    return (
      <menu>
        <li>
          <Button onClick={handleNext} disabled={!presentation.hasNext}>
            Next →
          </Button>
        </li>
      </menu>
    );
  }

  return (
    <Flex as="menu">
      <li>
        <Button onClick={handleBack}>← Back</Button>
      </li>
      <li>
        <Button onClick={handleNext} disabled={presentation.finished}>
          Next →
        </Button>
      </li>
    </Flex>
  );
}

type Props = {
  children: ReactNode;
};

export function Layout({ children }: Props) {
  const { states: awareness } = useAwareness();
  const timer = useTimer();

  const count = Object.keys(awareness).length;

  return (
    <div className={classes.layout}>
      <Flex as="header" className={classes.topbar}>
        <Flex justify="space-between" style={{ flex: "1 0 0" }}>
          <h1>
            <a href="/" target="_blank">
              Hindsight
            </a>
          </h1>

          <Flex gap="3rem">
            <div
              title={pluralize(
                count,
                "There's only you.",
                `There are ${count} people connected.`
              )}
            >
              <Reaction reaction="👤" count={count} />
            </div>

            <Flex as="menu" style={{ paddingInlineEnd: ".375rem" }}>
              <li>
                <Button
                  onClick={() => timer.clear()}
                  disabled={!timer.active}
                  color="negative"
                >
                  Clear
                </Button>
              </li>
              <li>
                <Button onClick={() => timer.addFive()}>+5 min.</Button>
              </li>
            </Flex>
          </Flex>
        </Flex>

        <Display target={timer.target} active={timer.active} />

        <Flex justify="space-between" style={{ flex: "1 0 0" }}>
          <Flex as="menu" style={{ paddingInlineStart: "3rem" }}>
            <li>
              <Button disabled>Play</Button>
            </li>
            <li>
              <Button disabled>Queue ⏑</Button>
            </li>
            <li>
              <Button disabled>Vol. ---*---</Button>
            </li>
          </Flex>

          <Pagination />
        </Flex>
      </Flex>

      <main className={classes.main}>{children}</main>

      <footer className={classes.footer}>
        <p>
          Made by <a href="https://twitter.com/haggen">me</a>. Source and
          feedback on{" "}
          <a
            href="https://github.com/haggen/hindsight"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
