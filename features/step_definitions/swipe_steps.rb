Given(/Initial Screen/) do
    #touch(asdf)
end

When (/^I swipe row with label "(.*?)" to the left$/) do |label|
    #flick("tableViewCell label marked:'#{label}' parent tableViewCell", {:x => -30});
    #flick("tableViewCell label marked:'#{label}' ", {:x => -11});
    flick("tableViewCell label {text LIKE '*#{label}*'}", {:x => -11});
end

Then /^I (?:should)? not see text containing "([^\"]*)"$/ do |text|
  res = query("view {text LIKE '*#{text}*'}")
  unless res.empty?
    screenshot_and_raise "Expect no text with #{text} but found #{res}"
  end
end
