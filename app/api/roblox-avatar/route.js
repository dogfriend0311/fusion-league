export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return Response.json({ error: 'No userId provided' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=420x420&format=Png&isCircular=false`
    )
    const data = await res.json()
    const imageUrl = data?.data?.[0]?.imageUrl

    if (!imageUrl) {
      return Response.json({ error: 'No image found' }, { status: 404 })
    }

    return Response.json({ imageUrl })
  } catch (err) {
    return Response.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}