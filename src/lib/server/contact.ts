import "server-only";
import { collections, type ContactMessageDoc } from "@/lib/server/db";

export interface ContactMessageInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessageItem {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

/** Inserts a new contact inquiry into the MongoDB contactMessages collection. */
export async function saveContactMessage(input: ContactMessageInput): Promise<{ id: string }> {
  const { contactMessages } = await collections();
  const doc: ContactMessageDoc = {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    message: input.message.trim(),
    createdAt: new Date(),
  };
  const res = await contactMessages.insertOne(doc);
  return { id: res.insertedId.toString() };
}

/** Retrieves the latest submitted contact messages, ordered newest first. */
export async function getContactMessages(limit = 100): Promise<ContactMessageItem[]> {
  try {
    const { contactMessages } = await collections();
    const docs = await contactMessages
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return docs.map((d) => ({
      id: d._id ? d._id.toString() : "",
      name: d.name,
      email: d.email,
      message: d.message,
      createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : new Date(d.createdAt).toISOString(),
    }));
  } catch (error) {
    console.error("[getContactMessages] failed to read from database:", error);
    return [];
  }
}
