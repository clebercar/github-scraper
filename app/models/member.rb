class Member < ApplicationRecord
  enum scraping_status: {
    pending: 0,
    processing: 1,
    completed: 2,
    failed: 3
  }
end
