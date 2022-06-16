# **************************************************************************** #
#                               DEV TOOLS
# **************************************************************************** #

STUFF_TO_REMOVE =

remove_stuff:
	@for stuff in $(STUFF_TO_REMOVE); do \
	printf "remove all [%s]\n" $$stuff;\
		find . -name $$stuff -prune -exec rm -rf {} \; ;\
	done

willa:
	git config --global user.name "willaCS"
	git config --global user.email "<noreply>@gmail.com"

fluffy:
	git config user.name "matthew-dreemurr"
	git config user.email "hadadmat@gmail.com"

git:
	@git pull
	@git diff
	@-git add .
	@git commit -am "Makefile push `date +'%Y-%m-%d %H:%M:%S'`"
	@-git push

# **************************************************************************** #

.PHONY: remove_stuff, update_lib, update, ping, ping_lib, git