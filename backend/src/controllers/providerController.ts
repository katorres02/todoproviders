import { NextFunction, Request, Response } from 'express';
import * as providerService from '../services/providerService';

export async function list(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await providerService.listProviders());
  } catch (err) {
    next(err);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await providerService.getProvider(req.params.id));
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await providerService.createProvider(req.body));
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await providerService.updateProvider(req.params.id, req.body));
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    await providerService.deleteProvider(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
