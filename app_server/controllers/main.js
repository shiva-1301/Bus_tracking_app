/* GET homepage */

const home = (req, res) => {
  res.render('index', { title: 'Home' });
};

/* GET passenger page */
// const student_login = (req, res) => {
//   res.render('index', { title: 'Student Login' });
// };

// const student_login = (req, res) => {
//   res.sendFile(path.join(__dirname, '../public/html/login_page.html'));
// };

const login = (req, res) => {
  res.render('login', { title: 'Student Login' });
};

/* GET passenger page */
const faculty_login = (req, res) => {
  res.render('index', { title: 'Faculty Login' });
};
/* GET passenger page */
const  roadmaps = (req, res) => {
  res.render('index', { title: 'Roadmaps' });
};

module.exports = {
  home,
  // student_login,
  login,
  faculty_login,
  roadmaps
};