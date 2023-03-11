// Write a nextjs api request to get data from the city of Orlando's open data portal
const apiUrl = "https://data.cityoforlando.net/resource/5pzm-dn5w.json"

export default async function handler(req, res) {
  const response = await fetch(apiUrl)
  const data = await response.json()
  res.status(200).json(data)
}
