//my page is number 7426 :))) in this example
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const app = express();

const port = process.env.PORT || 3000;

/**
 * process.cwd() trả về thư mục làm việc hiện tại, (thư mục mà đã gọi lệnh node từ đó).
 * __dirname trả về tên thư mục của thư mục chứa tệp mã nguồn JavaScript
 */
app.use("/public", express.static(process.cwd() + "/public"));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

const listeners = app.listen(port, () => console.log(`Listen port ${port}`));

// dns.lookup(host, cb) //verify submit url
/**
 * Về mặt đồng thời(concurrency) , tốt hơn nên sử dụng dns.resolve*(host,cb) vì các yêu cầu đó không kết thúc trong nhóm luồng(threadpool),
 * trong khi các yêu cầu dns.lookup() thực hiện vì chúng gọi ra trình phân giải DNS của hệ điều hành thường chặn (mặc dù hiện nay có một số loại giao diện không đồng bộ - - nhưng chúng không nhất thiết phải được thực hiện ở mọi nơi).
 * Hiện tại, node sử dụng nội bộ dns.lookup() cho bất kỳ phân giải DNS tự động nào, chẳng hạn như khi bạn chuyển tên máy chủ cho http.request().
 */
let arr = [];
app.post("/api/shorturl", (req, res) => {
  // console.log(typeof req.body.url);
  const originalURL = req.body.url;
  try {
    const urlObject = new URL(originalURL); //tao doi tuong url tu url truyen vao(de lay host)
    console.log(urlObject);
    dns.resolve(urlObject.hostname, (err, address) => {
      if (err) {
        return res.json({ error: "invalid url" });
      }
      arr.push(req.body.url);
      return res.json({ original_url: req.body.url, short_url: arr.length });
    });
  } catch (err) {
    return res.json({ error: "invalid URL" });
  }
  // console.log(arr);
});

app.get("/api/shorturl/:short_url", (req, res) => {
  const short_url = req.params.short_url;
  // console.log(typeof short_url);
  const regex = /^\d+$/;
  if (regex.test(short_url) || short_url === "0") {
    const num_short_url = +short_url;
    if (num_short_url > arr.length) {
      return res.json({ error: "no short url found" });
    } else {
      return res.redirect(arr[num_short_url - 1]);
    }
  } else {
    return res.json({ error: "wrong format" });
  }
});
