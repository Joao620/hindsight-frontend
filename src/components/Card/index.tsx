import { type FormEvent, type KeyboardEvent, useRef, useState } from "react";
import { Button } from "~/components/Button";
import { createCard } from "~/lib/createCard";
import { createId } from "~/lib/createId";
import { deleteCard } from "~/lib/deleteCard";
import { getParticipantId } from "~/lib/participantId";
import { UiReact } from "~/lib/store";
import { useCard } from "~/lib/useCard";
import { useParticipantVoteId } from "~/lib/useParticipantVoteId";
import { useTinyBaseObjects } from "~/lib/useTinyBaseObjects";
import { useVoteIdsByCardId } from "~/lib/useVoteIds";
import { Icon } from "../Icon";
import { MicPopup } from "../MicPopup";

type FormProps = {
  data?: { description: string };
  onSave: (data: { description: string }) => void;
  onDelete?: () => void;
  onCancel?: () => void;
};
//data é um péssimo nome, é meio que o texto atual ao clicar 'edit' no card
function Form({ data, onSave, onDelete, onCancel }: FormProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload = new FormData(event.currentTarget);
    const description = payload.get("description") as string;

    onSave({
      description,
    });

    event.currentTarget.reset();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const writeTranscribedText = (text: string) => {
    if (textAreaRef.current) {
        textAreaRef.current.value += text.trim();
      }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="relative flex flex-col gap-3" onClickCapture={(e) => e.preventDefault()}>
        <textarea
          rows={3}
          name="description"
          placeholder="Type something..."
          aria-label="Card"
          autoComplete="off"
          defaultValue={data?.description}
          // biome-ignore lint/a11y/noAutofocus: <explanation>
          autoFocus
          onKeyDown={handleKeyDown}
          ref={textAreaRef}
          required
        />
        {/*<MicPopup className="absolute right-3 bottom-0" writeTranscribedText={writeTranscribedText}></MicPopup>*/}
      </div>

      {data ? (
        <footer className="flex items-center gap-3 justify-between">
          <Button variant="negative" onClick={onDelete}>
            Delete
          </Button>

          <div className="flex items-center gap-3">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="positive">
              Save
            </Button>
          </div>
        </footer>
      ) : (
        <footer className="flex items-center justify-end">
          <Button type="submit">Add card</Button>
        </footer>
      )}
    </form>
  );
}

type CardProps = {
  cardId: string;
  presentation?: boolean;
};

export function Card({ cardId, presentation }: CardProps) {
  const [editing, setEditing] = useState(false);
  const { description } = useCard(cardId);
  const voteIds = useVoteIdsByCardId(cardId);
  const participantVoteId = useParticipantVoteId(cardId);
  const tinyBaseObjects = useTinyBaseObjects();

  // const handleVote = () => {
  //   createVote({ participantId: getParticipantId(), cardId });
  // };

  const handleVote = UiReact.useSetRowCallback("votes", createId(), () => ({
    voterId: getParticipantId(),
    cardId: cardId,
  }));

  // const handleUnvote = () => {
  //   if (!participantVoteId) {
  //     throw new Error("Can't unvote without a voteId");
  //   }
  //   deleteVote(participantVoteId);
  // };

  const handleUnvote = UiReact.useDelRowCallback(
    "votes",
    () => {
      if (!participantVoteId) {
        throw new Error("Can't unvote without a voteId");
      }
      return participantVoteId;
    },
    undefined,
    undefined,
    [participantVoteId],
  );

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleDelete = () => {
    deleteCard(tinyBaseObjects, cardId);
  };

  const handleSave = UiReact.useSetCellCallback(
    "cards",
    cardId,
    "description",
    (data: { description: string }) => {
      return data.description;
    },
    undefined,
    undefined,
    () => setEditing(false),
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      setEditing(false);
    }
  };

  return (
    <div
      className="bg-white rounded-md shadow p-3 flex flex-col gap-3 group"
      onKeyDown={handleKeyDown}
    >
      {editing ? (
        <Form
          data={{ description }}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={handleDelete}
        />
      ) : (
        <>
          <p className={`${presentation ? "text-2xl" : ""}`}>{description}</p>

          {presentation ? null : (
            <div className="flex items-center justify-between">
              <menu className="flex items-center gap-3">
                <li>
                  {participantVoteId ? (
                    <Button variant="active" onClick={handleUnvote}>
                      Unvote ({voteIds.length})
                    </Button>
                  ) : (
                    <Button onClick={handleVote}>
                      Vote ({voteIds.length})
                    </Button>
                  )}
                </li>
              </menu>

              <menu className="flex items-center gap-3 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 transition-opacity">
                <li>
                  <Button onClick={handleEdit}>Edit</Button>
                </li>
              </menu>
            </div>
          )}
        </>
      )}
    </div>
  );
}

type BlankProps = {
  defaults: { columnId: string };
};

function Blank({ defaults }: BlankProps) {
  const participantId = getParticipantId();
  const tinyBaseObjects = useTinyBaseObjects();

  const handleSave = (data: { description: string }) => {
    createCard(tinyBaseObjects, {
      participantId,
      columnId: defaults.columnId,
      description: data.description,
    });
  };

  return (
    <div className="bg-white rounded-md p-3">
      <Form onSave={handleSave} />
    </div>
  );
}

Card.Blank = Blank;
