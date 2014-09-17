require './api'

def fetch(date)
  fetcher = Fetcher.new(date)
  products = fetcher.fetch
  puts "#{products.count} new products from #{date.strftime('%Y-%m-%d')}"
  fetcher.results?
end

namespace :fetch do
  desc 'Fetch products from the last 2 day'
  task :last do
    date = DateTime.now
    fetch(date)
    fetch(date - 1.day)
  end

  desc 'Fetch all products'
  task :all do
    date = DateTime.now
    while fetch(date) do
      date = date - 1.day
    end
  end
end
