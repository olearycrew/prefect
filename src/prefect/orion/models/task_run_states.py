import contextlib
import sqlalchemy as sa
from sqlalchemy import select, delete
from typing import List
from uuid import UUID

from prefect.orion import schemas, models
from prefect.orion.orchestration import global_policy, core_policy
from prefect.orion.models import orm


async def create_task_run_state(
    session: sa.orm.Session,
    task_run_id: UUID,
    state: schemas.actions.StateCreate,
    apply_orchestration_rules: bool = True,
) -> orm.TaskRunState:
    """Creates a new task run state

    Args:
        session (sa.orm.Session): a database session
        task_run_id (str): the task run id
        state (schemas.actions.StateCreate): a task run state model

    Returns:
        orm.TaskRunState: the newly-created task run state
    """

    # load the task run
    run = await models.task_runs.read_task_run(session=session, task_run_id=task_run_id)

    if not run:
        raise ValueError(f"Invalid task run: {task_run_id}")

    initial_state = run.state.as_state() if run.state else None
    proposed_transition = (initial_state.type if initial_state else None, state.type)

    if apply_orchestration_rules:
        orchestration_rules = core_policy.transition_rules(*proposed_transition)
    else:
        orchestration_rules = []

    global_rules = global_policy.transition_rules(*proposed_transition)

    # create the new task run state
    async with contextlib.AsyncExitStack() as stack:
        context = {
            "initial_state": initial_state,
            "proposed_state": state,
            "run": run,
            "session": session,
            "task_run_id": task_run_id,
            "rule_signature": [],
            "finalization_signature": [],
        }

        for rule in orchestration_rules:
            context = await stack.enter_async_context(
                rule(context, *proposed_transition)
            )

        for rule in global_rules:
            context = await stack.enter_async_context(
                rule(context, *proposed_transition)
            )

        validated_state = orm.TaskRunState(
            task_run_id=context["task_run_id"],
            **context["proposed_state"].dict(shallow=True),
        )
        session.add(validated_state)
        await session.flush()
        context["validated_state"] = validated_state
        await stack.aclose()
    return validated_state


async def read_task_run_state(
    session: sa.orm.Session, task_run_state_id: UUID
) -> orm.TaskRunState:
    """Reads a task run state by id

    Args:
        session (sa.orm.Session): A database session
        task_run_state_id (str): a task run state id

    Returns:
        orm.TaskRunState: the task state
    """
    return await session.get(orm.TaskRunState, task_run_state_id)


async def read_task_run_states(
    session: sa.orm.Session, task_run_id: UUID
) -> List[orm.TaskRunState]:
    """Reads task runs states for a task run

    Args:
        session (sa.orm.Session): A database session
        task_run_id (str): the task run id

    Returns:
        List[orm.TaskRunState]: the task run states
    """
    query = (
        select(orm.TaskRunState)
        .filter(orm.TaskRunState.task_run_id == task_run_id)
        .order_by(orm.TaskRunState.timestamp)
    )
    result = await session.execute(query)
    return result.scalars().unique().all()


async def delete_task_run_state(
    session: sa.orm.Session, task_run_state_id: UUID
) -> bool:
    """Delete a task run state by id

    Args:
        session (sa.orm.Session): A database session
        task_run_state_id (str): a task run state id

    Returns:
        bool: whether or not the task run state was deleted
    """
    result = await session.execute(
        delete(orm.TaskRunState).where(orm.TaskRunState.id == task_run_state_id)
    )
    return result.rowcount > 0
