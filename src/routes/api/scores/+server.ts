import { json } from "@sveltejs/kit";

export async function POST({ request, platform }) {
  const { username, level } = await request.json();
  const db = platform?.env?.DB;

  if (db) {
    try {
      await db
        .prepare("INSERT INTO scores (username, level_reached) VALUES (?, ?)")
        .bind(username, level)
        .run();
      return json({ success: true });
    } catch (e) {
      console.error(e);
      return json({ success: false, error: (e as Error).message });
    }
  }
  // Mock success for local dev without D1 binding
  // console.log("Mock DB Insert:", username, level);
  return json({ success: true, mock: true });
}

export async function GET({ platform }) {
  const db = platform?.env?.DB;
  if (db) {
    try {
      const { results } = await db
        .prepare(
          "SELECT username, level_reached as level, created_at as date FROM scores ORDER BY level_reached DESC LIMIT 10",
        )
        .all();
      return json(results);
    } catch (e) {
      console.error(e);
      return json([]);
    }
  }
  // Mock data
  return json([
    { username: "MOCK", level: 99 },
    { username: "TEST", level: 1 },
  ]);
}
