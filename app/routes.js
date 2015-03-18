var Shoppinglist = require('./models/shoppinglists');
var Item = require('./models/items');
var Presets = require('./data/presets');
var ObjectId = require('mongoose').Types.ObjectId;
// middleware function to be used
// for every secured routes
var auth = function (req, res, next) {
  'use strict';
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
  } else {
    next();
  }
};

function getShoppinglists(res) {
  'use strict';
  Shoppinglist.find(function (err, lists) {
    if (err) {
      res.send(err);
    } else {
      res.json(lists);
    }
  });
}

function getItems(res) {
  'use strict';
  Item.find(function (err, items) {
    if (err) {
      res.send(err);
    } else {
      res.json(items);
    }
  });
}

// --- POST / GET ---
module.exports = function (app, passport) {
  'use strict';

  // get all shoppinglists
  // FIXME see /api/item
  app.get('/api/items', function (req, res) {
    // from mongo db -> via mongoose
    getItems(res);
  });

  app.put('/api/item/:id', function (req, res) {
    Item.findOneAndUpdate({_id: req.params.id}, {
      $set: {
        itemText: req.body.itemText,
        itemChecked: req.body.itemChecked
      }
    }, {upsert: true}, function (err) {
      if (err) {
        return res.send(500, {error: err});
      } else {
        return res.send('succesfully saved');
      }
    });
  });

  app.put('/api/list/:id', function (req, res) {
    Shoppinglist.findOneAndUpdate({_id: req.params.id}, {
      $set: {name: req.body.name},
      $addToSet: {items: req.body.items}
    }, {upsert: true}, function (err) {
      if (err) {
        return res.send(500, {error: err});
      } else {
        return res.send('succesfully saved');
      }
    });
  });

  app.get('/api/list/:idlist/:iditem', function (req, res) {
    Shoppinglist.aggregate([
      {$match: {_id: new ObjectId(req.params.idlist)}},
      {$unwind: '$items'},
      {$match: {'items._id': new ObjectId(req.params.iditem)}},
      {
        $project: {
          _id: 0,
          item: '$adwordsChanges.items'
        }
      }
    ], function (err, item) {
      if (err) {
        res.send(500, {error: err});
      } else {
        res.json(item);
      }
    });
  });

  app.post('/api/list', function (req, res) {
    new Shoppinglist(req.body).save(function () {
      return res.send('succesfully saved');
    });
  });

  app.get('/api/list', function (req, res) {
    getShoppinglists(res);
  });

  app.get('/loggedin', function (req, res) {
    // fixme: this is a bit hacky
    res.send(req.isAuthenticated() ? req.user : '0');
  });

  app.post('/login', passport.authenticate('local'), function (req, res) {
    res.send(req.user);
  });

  app.post('/logout', function (req, res) {
    req.logOut();
    // necessary, otherwise we still
    // look like logged in (why is that?)
    res.sendStatus(404);
  });

  app.get('/category', auth, function (req, res) {
    var products = Presets.categories.map(function (item) {
      return item.product;
    });
    res.json(products);
  });

  // -- application --
  app.get('/', function (req, res) {
    res.sendfile('./public/index.html');  // load the single view file
  });
};
