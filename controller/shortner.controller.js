import { deleteLink, findByid, getLinkByShortCode, loadLinks, saveLinks, updateLink } from "../services/services.js";


// LOAD UI 
export const getUrlPage = async (req, res) => {
  if(!req.user) return res.redirect("/")
  try {
    const id = req.user.id
    const links = await loadLinks(id)

    return res.render("urlshortner/urlshortner", { links, host: req.host });
  } catch (err) {
    return res.status(500).send("internal server error");
  }
};


// POST FORM
export const postUrl = async (req, res) => {
  const { url, shortCode } = req.body;
  const id = req.user.id

  const links = await getLinkByShortCode(shortCode);
  if (links) {
    return res.status(400).send("Short code already exists");
  }

  await saveLinks({ url, shortCode ,id });
  return res.redirect("/urlshortner");
};




// REDIRECT TO LINK
export const redirectToLink = async (req, res) => {

    const { shortCode } = req.params;
    const link = await getLinkByShortCode(shortCode);

    if (!link) return res.render("error")

    return res.redirect(link.url);

};



export const getEdit = async (req,res) => {
  const id = req.params.id
  const link = await findByid(id)
  res.render("urlshortner/edit",{link})
}

export const postEdit = async (req,res) => {
  const id = req.params.id
  const {url,shortCode} = req.body
  const update = await updateLink({id,url,shortCode})
  res.redirect("/urlshortner")
}

export const getDelete = async (req,res) => {
  const id = req.params.id
  const dlt = await deleteLink(id)
  res.redirect("/urlshortner")
}