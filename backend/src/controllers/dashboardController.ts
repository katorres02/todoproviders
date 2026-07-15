import { NextFunction, Request, Response } from 'express';
import * as dashboardService from '../services/dashboardService';

export async function get(_req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await dashboardService.getDashboard());
  } catch (err) {
    next(err);
  }
}
