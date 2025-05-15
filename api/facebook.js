export default async function handler(req, res) {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;

  if (!accessToken || !pageId) {
    return res.status(500).json({ error: 'Missing FACEBOOK_ACCESS_TOKEN or FACEBOOK_PAGE_ID' });
  }

  try {
    const url = `https://graph.facebook.com/v18.0/${pageId}/posts?access_token=${accessToken}&fields=message,created_time,permalink_url,full_picture&limit=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      console.error('Facebook API error:', data);
      return res.status(response.status).json({ error: data });
    }

    const posts = data.data.map(post => ({
      message: post.message,
      created_time: post.created_time,
      permalink_url: post.permalink_url,
      full_picture: post.full_picture
    }));

    return res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching Facebook posts:', error);
    return res.status(500).json({ error: 'Failed to fetch Facebook posts' });
  }
}
