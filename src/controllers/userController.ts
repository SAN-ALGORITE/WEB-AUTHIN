import { Request, Response } from "express";
import { User } from "../entities/user.entity";
import { BaseCrudService } from "../service/base-crud.service";
import { Device } from "../entities/devices.entity";
import { getDeviceName } from "../service/deviceService";

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users: { items: User[] } = await BaseCrudService.list(User);
    const devices: { items: Device[] } = await BaseCrudService.list(Device);
    const deviceMap = devices.items.reduce((acc, device) => {
      if (!acc[device.userId]) {
        acc[device.userId] = [];
      }
      acc[device.userId].push(device);
      return acc;
    }, {} as { [key: string]: Device[] });

    const usersWithDevices = users.items?.map((user) => {
      return {
        ...user,
        devices: deviceMap[user.id] || [],
      };
    });

    res.send(usersWithDevices);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
};

export const listDevices = async (req: Request, res: Response) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).send({
      error: "User not found",
    });
  }
  try {
    const devices: Device[] = await BaseCrudService.getByAttribute(
      "userId",
      userId,
      Device
    );

    const deviceDetails = devices.map((device) => {
      return {
        ...device,
        deviceDetails: getDeviceName(device.aaguid),
      };
    });

    res.send({ items: deviceDetails, status: "SUCCESS" });
  } catch (err) {
    console.log(err);
    res.send({ error: err, status: "FAILED" });
  }
};

export const deleteDevice = async (req: Request, res: Response) => {
  const { deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).send({
      error: "deviceId not found",
    });
  }
  try {
    const device: Device = await BaseCrudService.getById(deviceId, Device);

    if (!device) {
      return res.status(400).send({
        error: "Device not found",
      });
    }

    await BaseCrudService.remove(deviceId, Device);

    res.send({ status: "SUCCESS" });
  } catch (err) {
    console.log(err);
    res.send({ error: err, status: "FAILED" });
  }
};
