var express = require('express');
var router = express.Router();

const cassandra = require('cassandra-driver');
//const client = new cassandra.Client({ contactPoints: ['10.0.1.76'], keyspace: 'ninegag'});
const client = new cassandra.Client({ contactPoints: ['10.164.6.78,10.165.2.217'], keyspace: 'ninegag'});

/* GET home page. */
router.get('/empty', function(req, res, next) {
  res.send("true");
});

router.post('/vote', function(req, res, next) {

    const query = 'insert into post_user (postid, userid, upvote, downvote, timestamp) values (?, ?, ?, ?, dateOf(now()));'; 
    const params = [req.body.postid,req.body.userid,(req.body.score == 1)?1:0, (req.body.score == -1)?1:0];
    //Set the prepare flag in the query options
    client.execute(query, params, { prepare: true }, function(err, result) {

        if(err) {
            console.log(err);
             res.send(JSON.stringify({success:false}));
        } else {
            res.send(JSON.stringify({success:true}))
        }
    });
 
});

router.get('/vote-counts/:postid', function(req, res, next) {

    const query = 'select sum(downvote) as downvote, sum(upvote) as upvote from post_user where postid = ?;'; 
    const params = [req.params.postid];
    //Set the prepare flag in the query options
    client.execute(query, params, { prepare: true }, function(err, result) {

        if(err) {
            console.log(err);
             res.send(JSON.stringify({success:false}));
        } else {
            res.send(JSON.stringify({success:true,result:{upvote:result.rows[0].upvote,downvote:result.rows[0].downvote}}))
        }
    });
 
});

router.get('/vote-status/:userId', function(req, res, next) {

    const query = 'select * from user_timestamp where userid = ? limit 100;'; 
    const params = [req.params.userId];
    //Set the prepare flag in the query options
    client.execute(query, params, { prepare: true }, function(err, result) {

        if(err) {
            console.log(err)
             res.send(JSON.stringify({success:false}));
        } else {
            
            const j = result.rows.map( x => ({postid:x.postid,score:x.upvote + -1 * x.downvote}));
            res.send(JSON.stringify({success:true,result:j}));

        }
    });
 
});

module.exports = router;
