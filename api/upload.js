import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Methode nicht erlaubt' });
  }

  const { file, fileName } = req.body; // FormData wird in Next.js automatisch geparsed, aber für File brauchen wir Buffer
  // Da FormData mit File ist, verwenden wir req.files oder manuell parsen – Next.js braucht middleware für Multipart, aber für Einfachheit: Client sendet Base64.

  // Korrigiere: Im Client Base64 senden, da Next.js API keine built-in Multipart hat. Passe Client an.
  // Aber um es einfach zu halten: Nehmen wir an, wir lesen den File als Buffer.

  // Besser: Verwende Base64 vom Client.
  // Passe den Client-Code an: Im handleSubmit, lies File als Base64.

  // Hier im API: Erwarte base64Content und fileName im Body.

  const { base64Content, fileName } = req.body;

  if (!base64Content || !fileName) {
    return res.status(400).json({ error: 'Fehlende Daten' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_REPO = process.env.GITHUB_REPO; // z.B. 'username/aktenbilder-repo'
  const GITHUB_PATH = `images/${fileName}`; // Ordner 'images' im Repo

  if (!GITHUB_TOKEN || !GITHUB_REPO) {
    return res.status(500).json({ error: 'Server-Konfiguration fehlt' });
  }

  try {
    const response = await axios.put(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${GITHUB_PATH}`,
      {
        message: `Upload ${fileName}`,
        content: base64Content,
      },
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const url = response.data.content.download_url;
    res.status(200).json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}