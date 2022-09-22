import { v4 as uuidv4 } from "uuid";
import random from "../../lib/random";

export default async function createLink(req, res) {
  const { link } = req.body;
  const isUrl = (urlString) => {
    var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
      '(\\#[-a-z\\d_]*)?$','i'); // validate fragment locator
    return !!urlPattern.test(urlString);
  };
  if (!link || !isUrl(link)) {
    res.status(400).json({
      error:
        "you either didnt give me a link or your link is not a link at all.",
    });
  } else if (link.length < 330) {
    const id = uuidv4();
    const newLink = {
      id,
      link: new RegExp("^(http|https)://", "i").test(link)
        ? link
        : `https://${link}`,
      views: 1,
      created_at: Date.now(),
    };

    const url = random(6);
    console.log(url);

    res.status(200).json({
      short_link: url,
    });
  } else {
    res.status(400).json({
      error: "your link is too massive",
    });
  }
}
