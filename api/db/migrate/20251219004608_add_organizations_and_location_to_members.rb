class AddOrganizationsAndLocationToMembers < ActiveRecord::Migration[7.2]
  def change
    add_column :members, :organizations, :text, array: true, default: []
    add_column :members, :location, :string, null: true
  end
end
