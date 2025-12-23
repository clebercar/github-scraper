class MembersController < ApplicationController
  def index
    @members = Member.all
    render json: @members, status: :ok
  end

  def show
    @member = Member.find(params[:id])
    render json: @member, status: :ok
  end


  def destroy
    @member = Member.find(params[:id])
    @member.destroy
    render json: { message: "Member deleted successfully" }, status: :ok
  end

  def create
    @member = Member.new(member_params)
    @member.scraping_status = :pending if @member.url.present?

    if @member.save
      ScrapeGithubProfileJob.perform_later(@member.id) if @member.url.present?
      render json: @member, status: :created, location: @member
    else
      render_validation_errors(@member)
    end
  end

  def update
    @member = Member.find(params[:id])

    if @member.update(member_params)
      ScrapeGithubProfileJob.perform_later(@member.id) if @member.url.present?
      render json: @member, status: :created, location: @member
    else
      render_validation_errors(@member)
    end
  end

  private

  def member_params
    params.require(:member).permit(:name, :url)
  end

  def render_validation_errors(member)
    render json: {
      error: 'Validation failed',
      messages: member.errors.full_messages
    }, status: :unprocessable_entity
  end
end
