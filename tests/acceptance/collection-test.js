import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

import PageObject, { collection, hasClass, text } from 'ember-classy-page-object';
// import { findElement } from 'ember-classy-page-object/extend';

const SimpleListPage = PageObject.extend({
  scope: '[data-test-simple-list]',
  caption: text('[data-test-simple-list-caption]'),

  items: collection({
    scope: '[data-test-simple-list-item]',
    isActive: hasClass('is-active')
  })
});

moduleForAcceptance('Acceptance | collection');

test('collection works as expected', function(assert) {
  const list = SimpleListPage.create();

  visit('/');

  andThen(() => {
    assert.equal(list.caption, 'Hello, List!');
    assert.equal(list.items.eq(0).text, 'Foo');
    assert.deepEqual(list.items.map((i) => i.text), ['Foo', 'Bar', 'Baz']);

    let forEachText = [];
    list.items.forEach((i) => forEachText.push(i.text));
    assert.deepEqual(forEachText, ['Foo', 'Bar', 'Baz']);

    assert.deepEqual(list.items.findAll((i) => i.isActive || i.text === 'Foo').map((i) => i.text), ['Foo', 'Bar']);
    assert.deepEqual(list.items.findAll({ text: 'Bar', isActive: true }).map((i) => i.text), ['Bar']);
    assert.deepEqual(list.items.findAll({ text: 'Foo', isActive: true }).map((i) => i.text), []);

    assert.equal(list.items.findOne((i) => i.isActive).text, 'Bar');
    assert.equal(list.items.findOne({ text: 'Bar', isActive: true }).text, 'Bar');
    assert.equal(list.items.findOne({ text: 'Foo', isActive: true }), undefined);

    assert.throws(() => list.items.findOne((i) => i.isActive || i.text === 'Foo'), /Expected at most one result from findOne query, but found 2/);
  });
});

test('collections do not share instances of proxies', function(assert) {
  let page = PageObject.extend({
    scope: 'foo-bar-baz',

    simpleList: SimpleListPage
  }).create();

  // create a simple list to side-effect
  SimpleListPage.create();

  visit('/');

  andThen(() => {
    assert.throws(() => {
      assert.equal(page.simpleList.items.eq(0).text, 'Foo')
    }, /foo-bar-baz \[data-test-simple-list\] \[data-test-simple-list-item\]:eq\(0\)/);
  });
});
