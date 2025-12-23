class CreateMembers < ActiveRecord::Migration[7.2]
  def change
    create_table :members do |t|
      t.string :name, null: false
      t.string :url, null: false, unique: true
      t.string :username, null: true, unique: true
      t.string :avatar_url, null: true
      t.integer :followers_count, null: true
      t.integer :following_count, null: true
      t.integer :public_repos_count, null: true
      t.integer :starts_count, null: true
      t.integer :total_contributions_last_year, null: true
      t.timestamps
    end
  end
end
