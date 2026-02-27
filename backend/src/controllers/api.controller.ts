import type { Request, Response } from "express";

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "List of users" });
};

export const getUserOverview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.status(200).json({ message: `Overview of user ${req.params.id}` });
};

export const getMessages = async (
  req: Request,
  res: Response,
): Promise<void> => {
  res.status(200).json({ message: "List of processed messages" });
};
