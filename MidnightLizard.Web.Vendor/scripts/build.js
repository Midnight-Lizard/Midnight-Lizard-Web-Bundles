const { exec } = require('child_process');
var cmd;

if(process.env.NODE_ENV === 'production')
{
    cmd = "webpack -p --env.prod --optimize-minimize";
}
else
{
    cmd = "webpack";
}

exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.log(err);
    return;
  }

  console.log(`
------------------------------
install output:
${stdout}
------------------------------
`);
  console.log(`
------------------------------
install errors:
${stderr}
------------------------------
`);
});