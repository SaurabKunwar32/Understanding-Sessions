import Session from "../models/Session.js";


export const checkSession = async (req, res, next) => {
  const { sid } = req.signedCookies;
  console.log(sid);

  if (!sid) return res.status(401).json({ message: "Session ID not found" });

  try {
    const userSession = await Session.findById(sid);

    if (!userSession) {
      res.clearCookie("sid");
      return res.status(401).json({ message: "Session Expired" });
    }
    req.userSession = userSession;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Server error in session", error });
  }
};