require 'sinatra'
require 'json'
require 'mongoid'

Mongoid.load!('mongoid.yml')

class Product
  include Mongoid::Document

  field :name, type: String
  field :url, type: String
  field :tagline, type: String
  field :product_hunt_id, type: Integer
  field :product_hunt_url, type: String

  validates :name, presence: true
  validates :url, presence: true

  def self.with_tld(tld)
    tld = sanitize_tld(tld).gsub('.', '\\.')
    where(url: Regexp.new("\.#{tld}(\/.*)?$"))
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
      url: product.url
    }
  end

  response.to_json
end

get '/' do
  send_file File.join(settings.public_folder, 'index.html')
end
