class ShortUrlsController < ApplicationController
  def redirect
    sqids = Sqids.new(min_length: 6)
    decoded_ids = sqids.decode(params[:short_code])
    
    if decoded_ids.empty?
      render json: { error: "Invalid URL" }, status: :not_found
      return
    end

    member_id = decoded_ids.first
    member = Member.find_by(id: member_id)

    if member&.url
      redirect_to member.url, allow_other_host: true
    else
      render json: { error: "invalid URL" }, status: :not_found
    end
  rescue ActiveRecord::RecordNotFound
    render json: { error: "invalid URL" }, status: :not_found
  end
end

