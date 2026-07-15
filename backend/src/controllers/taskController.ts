import { NextFunction, Request, Response } from 'express';
import * as taskService from '../services/taskService';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await taskService.listTasks(res.locals.query ?? {}));
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await taskService.getTask(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await taskService.createTask(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await taskService.updateTask(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await taskService.deleteTask(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

export async function addComment(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await taskService.addComment(req.params.id, req.auth!.sub, req.body.text));
  } catch (err) {
    next(err);
  }
}

export async function removeComment(req: Request, res: Response, next: NextFunction) {
  try {
    await taskService.deleteComment(req.params.commentId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
