[TLD Hunt](http://tlds.timpetricola.com/) [![Build Status](https://travis-ci.org/TimPetricola/TLD-Hunt.svg?branch=master)](https://travis-ci.org/TimPetricola/TLD-Hunt) [![Code Climate](https://codeclimate.com/github/TimPetricola/TLD-Hunt/badges/gpa.svg)](https://codeclimate.com/github/TimPetricola/TLD-Hunt)
=========================================

Search products by their TLD (.com, .io, ...).

Setup
-----

1. Clone repository
2. `bundle install`
3. Define `PRODUCT_HUNT_ACCESS_TOKEN` environment variable in `.env`
4. `rake fetch:last` to fetch products from the last 2 days or `rake fetch:all` to fetch all products from [Product Hunt](http://www.producthunt.com/)
5. `foreman start` to start the server
