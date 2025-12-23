class AddShortUrlToMembers < ActiveRecord::Migration[7.2]
  def change
    add_column :members, :short_url, :string, null: true
    add_index :members, :short_url, unique: true
  end
end
