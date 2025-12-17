class MembersController < ApplicationController
  def create
    @member = Member.new(member_params)
    @member.scraping_status = :pending if @member.url.present?

    if @member.save
      ScrapeGithubProfileJob.perform_later(@member.id) if @member.url.present?

      render json: @member, status: :created, location: @member
    else
      render json: @member.errors, status: :unprocessable_content
    end
  end

  private

    def member_params
      params.require(:member).permit(:name, :url)
    end
end
