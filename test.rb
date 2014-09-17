ENV['RACK_ENV'] = 'test'

require './api'
require 'test/unit'

class SanitizeTests < Test::Unit::TestCase
  def test_repeated_dots
    assert_equal 'com.au', sanitize_tld('com...au')
  end

  def test_leading_dot
    assert_equal 'com', sanitize_tld('.com')
    assert_equal 'com', sanitize_tld('..com')
  end

  def test_special_characters
    assert_equal '', sanitize_tld('@0*-_')
  end

  def test_upcase
    assert_equal 'com', sanitize_tld('COM')
  end
end


class ProductsTest < Test::Unit::TestCase
  def assert_hostname(output, input)
    assert_equal output, Product.new(url: input).hostname
  end

  def test_hostname
    assert_hostname 'example.com', 'http://example.com'
    assert_hostname 'example.com', 'http://www.example.com'
    assert_hostname 'example.com', 'http://www.example.com/foobar'
  end

  def test_with_tld
    products = Product.create([
      { name: 'Foobar', url: 'http://example.com' },
      { name: 'Foobar', url: 'http://example.com/' },
      { name: 'Foobar', url: 'http://example.com/foo' },
      { name: 'Foobar', url: 'http://example.co' },
      { name: 'Foobar', url: 'http://example.co/foo' },
      { name: 'Foobar', url: 'http://example.co.uk' },
    ])

    assert_equal 3, Product.with_tld('com').size
    assert_equal 2, Product.with_tld('co').size
    assert_equal 1, Product.with_tld('co.uk').size

    products.each(&:destroy)
  end
end
