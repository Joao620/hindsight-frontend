import type { FormEvent } from "react";

import * as classes from "./style.module.css";

import { Button } from "~/src/components/Button";
import { type TColumn, useColumns } from "~/src/lib/data";

type Props = {
	column: TColumn;
	onFinish?: () => void;
};

export function Edit({ column, onFinish }: Props) {
	const [, { update, destroy }] = useColumns();

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const inputs = e.currentTarget.elements as unknown as {
			title: HTMLInputElement;
		};

		update({ ...column, title: inputs.title.value });

		e.currentTarget.reset();

		onFinish?.();
	};

	const handleDelete = () => {
		destroy(column.id);
	};

	const handleCancel = () => {
		onFinish?.();
	};

	return (
		<form className={classes.form} onSubmit={handleSubmit}>
			<input
				type="text"
				name="title"
				defaultValue={column.title}
				placeholder="Type something…"
				className={classes.title}
				maxLength={26}
				required
			/>

			<menu className={classes.menu}>
				<li>
					<Button onClick={handleDelete} color="negative">
						Delete
					</Button>
				</li>
				<li>
					<ul>
						<li>
							<Button type="submit" color="positive">
								Save
							</Button>
						</li>
						<li>
							<Button onClick={handleCancel}>Cancel</Button>
						</li>
					</ul>
				</li>
			</menu>
		</form>
	);
}
