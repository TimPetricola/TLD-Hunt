require 'sinatra'
require 'json'
require 'mongoid'
require 'uri'

Mongoid.load!('mongoid.yml')

class Product
  include Mongoid::Document

  URLS_BLACKLIST = %w(
    bit.ly
    chrome.google.com/webstore
    github.io
    goo.gl
    herokuapp.com
    itunes.apple.com
    play.google.com
  )

  field :name, type: String
  field :url, type: String
  field :tagline, type: String
  field :product_hunt_id, type: Integer
  field :product_hunt_url, type: String

  validates :name, presence: true
  validates :url, presence: true, uniqueness: true
  validate :url_not_blacklisted

  def hostname
    URI.parse(url).host.gsub('www.', '')
  end

  def self.with_tld(tld)
    tld = sanitize_tld(tld).gsub('.', '\\.')
    where(url: Regexp.new("\.#{tld}(\/.*)?$"))
  end

  private

  def url_not_blacklisted
    URLS_BLACKLIST.each do |blacklisted|
      next unless url.downcase.include?(blacklisted)
      return errors.add(:url, "URLs from #{blacklisted} are blacklisted")
    end
  end
end
end

def sanitize_tld(tld)
  tld.to_s.downcase.gsub(/\.\.+/, '.').gsub(/^\./, '').gsub(/[^a-z\.]/, '')
end

get '/tld/:tld' do
  content_type :json

  tld = sanitize_tld(params[:tld])
  products = Product.with_tld(tld)

  response = {
    tld: tld,
    total_count: products.length
  }

  response[:products] = products.map do |product|
    {
      name: product.name,
      url: product.url,
      hostname: product.hostname
    }
  end

  response.to_json
end

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end
