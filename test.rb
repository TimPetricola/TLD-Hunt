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
