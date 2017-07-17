const assert = require('assert');
const User = require('../src/user');
const Comment = require('../src/comment');
const BlogPost = require('../src/blogPost');

describe('Associations', () => {
  let joe, blogPost, mycomment;
  beforeEach((done) => {
    joe = new User({name: 'Joe'});
    blogPost = new BlogPost({title: 'JS is Great', content: 'Yeah it really is'});
    mycomment = new Comment({content: 'Great post'});

    joe.blogPosts.push(blogPost);
    blogPost.comments.push(mycomment);
    mycomment.user = joe;

    Promise.all([
      joe.save(),
      blogPost.save(),
      mycomment.save()
    ])
    .then(() => done());
  });

  it('saves a relation btw a user and a blogpost', (done) => {
    User.findOne({name: 'Joe'})
      .populate('blogPosts')
      .then((user) => {
        assert(user.blogPosts[0].title === 'JS is Great');
        done();
      });
  });

  it('saves a full relation tree', (done) => {
    User.findOne({name: 'Joe'})
      .populate({
        path: 'blogPosts',
        populate: {
          path: 'comments',
          model: 'comment',
          populate: {
            path: 'user',
            model: 'user'
          }
        }
      })
      .then((user) => {
        assert(user.name === 'Joe');
        assert(user.blogPosts[0].title === 'JS is Great');
        assert(user.blogPosts[0].comments[0].content === 'Great post');
        assert(user.blogPosts[0].comments[0].user.name === 'Joe');
        done();
      });
  });
});
