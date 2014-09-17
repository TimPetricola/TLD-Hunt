require 'sinatra'
require 'json'
require 'mongoid'
require 'uri'
require 'rest_client'

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
    where(url: Regexp.new("\\.#{tld}(\\/.*)?$"))
  end

  private

  def url_not_blacklisted
    URLS_BLACKLIST.each do |blacklisted|
      next unless url.downcase.include?(blacklisted)
      return errors.add(:url, "URLs from #{blacklisted} are blacklisted")
    end
  end
end

class Fetcher
  ENDPOINT = 'https://api.producthunt.com/v1/posts'

  attr_reader :products

  def initialize(date = DateTime.now)
    @date = date
    @results = false
  end

  def fetch
    products_from_response(api_call)
  end

  def results?
    @results
  end

  private

  def api_call
    params = {
      access_token: ENV['PRODUCT_HUNT_ACCESS_TOKEN'],
      day: @date.strftime('%Y-%m-%d')
    }
    RestClient::Resource.new(ENDPOINT, verify_ssl: false).get(params: params)
  end

  def products_from_response(response)
    raw = JSON.parse(response.body)['posts']
    @results = raw.length > 0

    @products = raw.map do |detail|
     Product.create(
        name: detail['name'],
        url: url_from_detail(detail),
        tagline: detail['tagline'],
        product_hunt_id: detail['id'],
        product_hunt_url: detail['discussion_url']
      )
    end
    @products = products.select(&:persisted?)
  end

  def url_from_detail(detail)
    screenshot_params = URI.parse(detail['screenshot_url'].values.last).query
    URI::decode_www_form(screenshot_params).to_h['url']
  end
end

def sanitize_tld(tld)
  tld.to_s.downcase.gsub(/\.\.+/, '.').gsub(/^\./, '').gsub(/[^a-z\.]/, '')
end

get '/tld/:tld' do
  content_type :json

  limit = 100
  skip = (params[:offset] || 0).to_i

  tld = sanitize_tld(params[:tld])
  products = Product.with_tld(tld)

  response = {
    tld: tld,
    total_count: products.count
  }

  response[:products] = products.limit(limit).skip(skip).map do |product|
    {
      name: product.name,
      url: product.url,
      hostname: product.hostname
    }
  end

  response.to_json
end

get '/' do
  erb :index
end
