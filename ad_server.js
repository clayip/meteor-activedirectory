const ActiveDirectory = Npm.require('activedirectory');
const Future = Npm.require('fibers/future');
let ad_def_config = { url: false,
  baseDN: false,
  username: false,
  password: false
}
ad_def_config = _.extend(ad_def_config,Meteor.settings.ldap);

Accounts.registerLoginHandler(function (input_name) {
  const future = new Future();
  let userId = null;
  const user = Meteor.users.findOne({username: input_name.user});
  if(!user) {
    em_address =
    userId = Accounts.createUser({username: input_name.user,email:input_name.email});
    future.return({userId: userId});
  } else {
    userId = user._id;
  //  console.log({userId: userId});
    future.return({userId: userId});
  }
  //console.log({userId: userId});
  return future.wait();
});

Meteor.methods({
  authWithLDAP : function (options) {
    const future = new Future();
    const ad = new ActiveDirectory(ad_def_config);
    //  console.log(JSON.stringify(options));
    const flag = 0;
    const finalChoice = ad.findUser(options.username, function(err, user) {
      if (err) {
        future.throw(err);
      }
      else if (! user) {
        future.throw(new Meteor.Error("validation-failed", `User: ${options.username} not found.`));
      }
      else {
        //console.log("YESS  " + JSON.stringify(options)+ JSON.stringify(user));
        ad.authenticate(user.cn, options.adPass, function(err, auth) {
          if (err) {
            future.throw(err);
          }
          if (auth) {
            future.return(true);
          } else {
            //pwd
            future.throw(new Meteor.Error('authentication-failed',`Authentication Failed for user ${options.username}`));
          }
        });
      }
    });
    return future.wait();
  }
});
