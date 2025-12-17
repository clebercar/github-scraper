class AddScrapingStatusToMembers < ActiveRecord::Migration[7.2]
  def change
    add_column :members, :scraping_status, :integer, default: 0, null: false
  end
end

