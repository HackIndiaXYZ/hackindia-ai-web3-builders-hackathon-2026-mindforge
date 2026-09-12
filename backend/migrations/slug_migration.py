import psycopg2
import re

conn_str = "postgresql://postgres.ayoqcytmcdpcaqfzihnx:agentforgedatabasepassword@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
conn = psycopg2.connect(conn_str)
conn.autocommit = True
cur = conn.cursor()

cur.execute("ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;")
cur.execute("ALTER TABLE agent_configs ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;")

cur.execute("SELECT id, name, slug FROM workspaces;")
rows = cur.fetchall()

existing_slugs = set()
for r in rows:
    ws_id, name, slug = r
    if not slug:
        clean = re.sub(r'[^a-zA-Z0-9]+', '-', name.lower()).strip('-')
        base_slug = clean or "agent"
        candidate = base_slug
        count = 1
        while candidate in existing_slugs:
            candidate = f"{base_slug}-{str(ws_id)[:4]}-{count}"
            count += 1
        cur.execute("UPDATE workspaces SET slug = %s WHERE id = %s;", (candidate, ws_id))
        existing_slugs.add(candidate)
        print(f"Set workspace {ws_id} ({name}) -> slug: {candidate}")
    else:
        existing_slugs.add(slug)
        print(f"Workspace {ws_id} ({name}) already has slug: {slug}")

cur.close()
conn.close()
print("Slug migration complete!")
