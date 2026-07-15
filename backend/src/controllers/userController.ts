import { NextFunction, Request, Response } from 'express';
import * as userService from '../services/userService';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await userService.listUsers());
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await userService.getUser(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await userService.updateUser(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await userService.deleteUser(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
