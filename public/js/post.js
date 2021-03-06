let timeoutHandlerCommentDelete, timeoutHandlerPostDelete;
let input = document.querySelector('input[name="community"]');
let search = document.querySelector('.search');
let container = document.querySelector('.dropdown-container');
let matches;
let privacy = document.querySelector('.privacy-toggle');
let allCommunities = [];
let addCommentForm = document.querySelector("#new-comment-form");
let addCommentInput = document.querySelector("#new-comment-input");
let replyButtons = document.querySelectorAll(".reply-btn");
let sendReplyButton = document.querySelector("#send-reply-btn");
let editButtons = document.querySelectorAll(".edit-btn");
let deleteConfirmButtons = document.getElementsByClassName("delete-confirm");
let deleteButtons = document.querySelectorAll(".delete-btn");
let comment;
let currentContent;

function addPostEventListeners() {
    let checkCommunity = document.querySelector('div.new-post input[name="community"]');
    if (checkCommunity != null)
        checkCommunity.addEventListener('input', sendCheckCommunityRequest);

    if (newPostPrivacyToggle != null) {
        newPostPrivacyToggle.addEventListener('change', () => {
            if (!newPostPrivacyToggle.hasAttribute("checked")) {
                newPostPrivacyToggleLabel.innerHTML = "Private Account";
                newPostPrivacyToggle.setAttribute("checked", "checked");
            } else {
                newPostPrivacyToggleLabel.innerHTML = "Public Account";
                newPostPrivacyToggle.removeAttribute("checked");
            }
        });
    }

    if (addCommentForm != null)
        addCommentForm.addEventListener('submit', sendNewComment);

    addReplyButtonsListener();
    addVotesEventListener();
    addEditButtonsListener();
    addDeleteButtonsListener();
    addDeleteConfirmButtonsListener();
    addReportButtonsEventListeners();
    postFading();
}

function addReplyButtonsListener() {
    replyButtons = document.querySelectorAll(".reply-btn");
    if (replyButtons.length != 0) {
        replyButtons.forEach(function (item) {
            if (item.getAttribute('data-target').match(/comment[0-9]+/) && !item.classList.contains('has-listener'))
                item.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    let id = item.getAttribute('data-target');
                    item.classList.add('has-listener');
                    addReplyForm(id);
                });
        });
    }
}

function addVotesEventListener() {
    let voteButtons = document.querySelectorAll(".vote-button");

    if (voteButtons.length != 0) {
        voteButtons.forEach((item) => {
            //console.log("here");
            if (!item.classList.contains('disabled-voting') && !item.classList.contains('has-listener')) {
                changeVoteColor(item);
                item.classList.add('has-listener');
                item.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    voteButtonClicked(item);
                });
            } else {
                if (!item.classList.contains('has-listener'))
                    item.classList.remove('vote-button');
            }
        });
    }
}

function addEditButtonsListener() {
    editButtons = document.querySelectorAll(".edit-btn");
    if (editButtons.length != 0) {
        editButtons.forEach((item) => {
            if (!item.classList.contains('has-listener')) {
                item.classList.add('has-listener');
                item.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    addEditCommentForm(item);
                });
            }
        });
    }

    let editPostButton = document.querySelector("#edit-post-btn");
    if (editPostButton != null) {
        editPostButton.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            addEditPostForm(editPostButton);
        })
    }
}

function addDeleteButtonsListener() {
    deleteButtons = document.querySelectorAll(".delete-btn");
    if (deleteButtons.length != 0) {
        deleteButtons.forEach(function (item) {
            if (!item.classList.contains('has-listener')) {
                item.classList.add('has-listener');
                item.addEventListener('click', function (event) {
                    // event.preventDefault();
                    // event.stopPropagation();
                    openDeleteConfirmModal(item);
                });
            }
        });
    }
}

function addDeleteConfirmButtonsListener() {
    deleteConfirmButtons = document.querySelectorAll(".delete-confirm");
    if (deleteConfirmButtons.length != 0) {
        // console.log("deleteConfirmButtons " + deleteConfirmButtons.length);
        deleteConfirmButtons.forEach(function (item) {
            if (!item.classList.contains('has-listener')) {
                item.classList.add('has-listener');
                item.addEventListener('click', function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    sendDeleteConfirmObject(item);
                });
            }
        });
    }
}

function addReportButtonsEventListeners() {
    let reportButtons = document.querySelectorAll(".report-button");

    if (reportButtons.length > 0) {
        reportButtons.forEach((item) => {
            if (!item.classList.contains('has-listener')) {
                item.addEventListener('click', (event) => {
                    item.classList.add('has-listener');
                    // console.log("click click");
                    event.preventDefault();
                    let modalId = item.getAttribute('data-target');
                    let modal = document.querySelector(modalId);
                    let objectId = item.getAttribute('data-object');
                    modal.setAttribute('data-object', objectId);
                })
            }
        });
    }

    // let ask_deletion_btns = document.querySelectorAll(".ask-deletion-button");
    // if (ask_deletion_btns.length > 0) {
    //     ask_deletion_btns.forEach((item) => {
    //         if (!item.classList.contains('has-listener')) {
    //             item.addEventListener('click', (event) => {
    //                 item.classList.add('has-listener');
    //                 console.log("click click");
    //                 event.preventDefault();
    //                 let objectId = item.getAttribute('data-object');
    //                 askDeletion(objectId);
    //             })
    //         }
    //     });
    // }
}

function encodeForAjax(data) {
    if (data == null) return null;
    return Object.keys(data).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(data[k])
    }).join('&');
}

function sendAjaxRequest(method, url, data, handler) {
    let request = new XMLHttpRequest();

    request.open(method, url, true);
    request.setRequestHeader('X-CSRF-TOKEN', document.querySelector('meta[name="csrf-token"]').content);
    request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    request.addEventListener('load', handler);
    request.send(encodeForAjax(data));
}

function changeVoteColor(item) {
    if (item.getAttribute('data-vote-type') == "up" && item.children[0].hasAttribute('data-checked')) {
        item.children[0].style.color = "green";
    } else if (item.getAttribute('data-vote-type') == "down" && item.children[0].hasAttribute('data-checked')) {
        item.children[0].style.color = "red";
    }
}

function voteButtonClicked(item) {
    // method = "put", route, targetId, voteType
    let route = item.getAttribute('data-route');
    let voteType = item.getAttribute('data-vote-type');
    let targetId = item.getAttribute('data-target-id');
    let argumentsObject;
    let pattern = /\/post\/[0-9]+\/vote/i;

    let upvoteLableId = "upvote-label-" + targetId;
    let upvoteLable = document.getElementById(upvoteLableId);
    let downvoteLableId = "downvote-label-" + targetId;
    let downvoteLable = document.getElementById(downvoteLableId)

    if (item.children[0].hasAttribute('data-checked')) {
        item.children[0].style.color = "black";
        item.children[0].removeAttribute('data-checked');
        if (voteType == "up") {
            upvoteLable.innerHTML = parseInt(upvoteLable.innerHTML) - 1;
        } else {
            downvoteLable.innerHTML = parseInt(downvoteLable.innerHTML) - 1;
        }
        method = "delete";
    } else if (voteType == "up") {
        item.children[0].style.color = "green";
        item.children[0].setAttribute("data-checked", "data-checked");
        upvoteLable.innerHTML = parseInt(upvoteLable.innerHTML) + 1;
        let otherButton = document.getElementById("downvote-button-" + targetId);
        if (otherButton.hasAttribute('data-checked')) {
            // Frontend changes
            downvoteLable.innerHTML = parseInt(downvoteLable.innerHTML) - 1;
            otherButton.style.color = "black";
            otherButton.removeAttribute('data-checked');
            //Backend Changes
            //Edit Vote
            method = "put";
        } else {
            method = "post";
        }
    } else {
        item.children[0].style.color = "red";
        item.children[0].setAttribute("data-checked", "data-checked");
        downvoteLable.innerHTML = parseInt(downvoteLable.innerHTML) + 1;
        let otherButton = document.getElementById("upvote-button-" + targetId);
        if (otherButton.hasAttribute('data-checked')) {
            // Frontend changes
            upvoteLable.innerHTML = parseInt(upvoteLable.innerHTML) - 1;
            otherButton.style.color = "black";
            otherButton.removeAttribute('data-checked');
            //Backend Changes
            //Edit Vote
            method = "put";
        } else {
            method = "post"
        }
    }

    // console.log("route ->" + route);
    if (route.match(pattern)) {
        argumentsObject = { vote_type: voteType }
    } else {
        argumentsObject = { comment_id: targetId, vote_type: voteType };
    }
    sendAjaxRequest(method, route, argumentsObject, displayResponse);
}

function displayResponse() {
    let response = JSON.parse(this.responseText);
    // console.log(response)
}

function sendCheckCommunityRequest(event) {
    let checkCommunity = document.querySelector('div.new-post input[name="community"]');
    let name = checkCommunity.value;

    if (name != '')
        sendAjaxRequest('post', '/api/communities', { community_name: name }, communityCheckedHandler);

    event.preventDefault();
}

function sendNewComment(event) {
    event.preventDefault();
    event.stopPropagation();

    let user_id = document.querySelector('input[name=user_id]').value;
    let post_id = document.querySelector('input[name=post_id]').value;
    let comment_content = addCommentInput.value;

    sendAjaxRequest('post', '/comment', {
        user_id: user_id,
        post_id: post_id,
        content: comment_content
    }, newCommentHandler);
}

function reportPost(event) {
    // console.log('reportPost');
    event.preventDefault();
    event.stopPropagation();

    let post_id = document.getElementById('modalPostReport').getAttribute('data-object');
    let reasonSelect = document.getElementById('postReportReason');
    let reasonOption = reasonSelect.options[reasonSelect.selectedIndex].innerHTML;
    // console.log(reasonOption);
    sendAjaxRequest('post', '/post/' + post_id + '/report', { reason: reasonOption });
    $('#modalPostReport').modal('hide');
}

function reportCommunity(event) {
    // console.log('reportCommunity');
    event.preventDefault();
    event.stopPropagation();

    let community_id = document.getElementById('modalCommunityReport').getAttribute('data-object');
    let reasonSelect = document.getElementById('communityReportReason');
    let reasonOption = reasonSelect.options[reasonSelect.selectedIndex].innerHTML;
    // console.log(reasonOption);
    ///community/{community_id}/report
    sendAjaxRequest('post', '/community/' + community_id + '/report', { reason: reasonOption });
    $('#modalCommunityReport').modal('hide');
}

function reportComment(event) {
    // console.log('reportComment');
    event.preventDefault();
    event.stopPropagation();

    let comment_id = document.getElementById('modalCommentReport').getAttribute('data-object');
    let reasonSelect = document.getElementById('commentReportReason');
    let reasonOption = reasonSelect.options[reasonSelect.selectedIndex].innerHTML;
    // console.log(reasonOption);
    ///community/{community_id}/report
    sendAjaxRequest('post', '/comment/' + comment_id + '/report', { reason: reasonOption });
    $('#modalCommentReport').modal('hide');
}


function askForDeletion(event) {
    // console.log('askdeletionCommunity');
    event.preventDefault();
    event.stopPropagation();
    let community_id = document.getElementById('modalCommunityDeletion').getAttribute('data-object');
    $('#modalCommunityDeletion').modal('hide');
    sendAjaxRequest('post', '/community/' + community_id + '/report', { reason: "I started this community and I would like to close it." });
}

function newCommentHandler() {
    // console.log(this.responseText);
    let response = JSON.parse(this.responseText);

    let comment = response['comment'];
    let commentSection = document.getElementById("post-comment-section");
    let newComment = document.createElement('div');

    let commentId = comment['id'];
    // console.log("O novo comentario tem id " + commentId);
    let commentContent = comment['content'];
    let commentUser = comment['id_author'];
    let commentPost = comment['id_post'];
    addCommentInput.value = "";
    addCommentInput.rows = 1;
    let authorUsername = response['extras']['author_username'];
    let authorImage = response['extras']['author_photo'];

    if (authorImage.search(/google/) == -1)
        authorImage = "/" + authorImage;

    newComment.setAttribute('id', `comment${commentId}`);
    newComment.setAttribute('class', 'card mb-2 post-container post-comment');
    // newComment.setAttribute('style', 'margin-left: 6%;');

    newComment.innerHTML = `
        <div class="row pt-4">

            <div class="d-flex align-items-end justify-content-end">
                <div class="col">
                    <div class="row">
                        <div class="d-flex justify-content-between pr-1">
                            <a>
                                <i class="fas fa-chevron-up fa-lg pb-2 disabled-voting"></i>
                            </a>
                        </div>
                        <div class="d-flex justify-content-center pb-2">
                            <a>
                                <p class="mb-0"> 0 </p>
                            </a>
                        </div>
                    </div>
                    <div class="row">
                        <div class="d-flex justify-content-between pr-1">
                            <a>
                                <i class="fas fa-chevron-down fa-lg pb-2 disabled-voting"></i>
                            </a>
                        </div>
                        <div class="d-flex justify-content-center">
                            <a>
                                <p> 0 </p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-10 mx-auto" id="comment-content-container-${commentId}" >
                <p class="card-text" id="comment-body-${commentId}" style="white-space: pre-line">
                    ${commentContent}
                </p>
            </div>

        </div>
        <div class="card-footer row text-muted p-3"
            style="border-top: 3px solid rgba(76, 25, 27, 0.444); background-color: white;">
            <div class="col-md-6 align-self-center">
                <div class="card-footer-buttons row align-content-center justify-content-start">
                <a href="" data-target="comment${commentId}" class ="reply-btn"><i class="fas fa-reply"></i>Reply</a>
                <a href="" class="delete-btn" data-toggle="modal" data-target="#modalDeleteComment"
                data-object="${commentId}" data-route="/comment/${commentId}" data-type="comment">
                <i class="fas fa-trash-alt"></i>Delete
                </a>
                <a href="" class="edit-btn" data-comment-id="${commentId}">
                <i class="fas fa-eraser"></i>Edit
                </a>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="row align-self-center justify-content-end">
                <a href="/user/${commentUser}">
                    <img class="profile-pic-small" height="35" width="35" src="${authorImage}" alt="">
                </a>
                <span class="px-1 align-self-center">Just now by </span>
                <a href="/user/${commentUser}" class="my-auto">
                <span>@</span>${authorUsername}</a>
                </div>
            </div>
        </div>`;

    let replies = document.createElement('div');
    replies.setAttribute('id', "replies" + commentId);
    // replies.style.marginLeft = "6%";

    // console.log(commentSection);
    commentSection.insertBefore(newComment, commentSection.childNodes[0]);
    newComment.insertAdjacentElement("afterend", replies)
    addReplyButtonsListener();
    addDeleteButtonsListener();
    addDeleteConfirmButtonsListener();
    addEditButtonsListener();
}

function addReplyForm(id) {
    let replyFormContainer = document.getElementById("reply-container");
    if (replyFormContainer == null) {
        let comment_id = id.substring(7, id.length);
        let targetComment = document.getElementById(id);

        targetComment.parentElement;
        replyFormContainer = document.createElement('div');
        replyFormContainer.setAttribute('id', `reply-container`);
        replyFormContainer.setAttribute('class', 'card post-container reply-container mb-2');
        if (targetComment.parentNode.id != "post-comment-section")
            replyFormContainer.setAttribute('style', 'margin-left: 6%;');

        replyFormContainer.innerHTML = `
            <div class="card-body">
                <form id="reply-form">
                    <input hidden name="comment_id" value="${comment_id}">
                    <div class="row" style="font-size: 0.45rem;">
                        <div class="col-md-10 pr-md-0">
                            <textarea id="reply-input" rows="1" onclick="this.rows = '8';" class="form-control mr-0"
                                placeholder="New Comment"></textarea>
                        </div>
                        <!--<div class="col-md-1 my-auto mx-auto text-right">-->
                        <div class="col-md-1 my-auto mx-auto text-right px-0 text-center comment-button">
                            <button type="submit" class="btn btn-md btn-dark" id ="send-reply-btn"> Reply </button>
                        </div>
                    </div>
                </form>
            </div>`;

        targetComment.insertAdjacentElement('afterend', replyFormContainer);
        let replyForm = document.querySelector("#reply-form");
        if (replyForm != null) {
            replyForm.addEventListener('submit', function (event) {
                event.preventDefault();
                event.stopPropagation();
                sendCommentReply();
            });
        }
        // let replyInput = document.getElementById("reply-input-" + id);
        // replyInput.addEventListener('blur', () => { replyFormContainer.remove(); });
    }
}

function addEditCommentForm(item) {
    let id = item.getAttribute('data-comment-id');
    let editFormContainer = document.getElementById("edit-container");
    if (editFormContainer == null) {
        let content = document.getElementById("comment-content-container-" + id);
        let objectBody = document.getElementById("comment-body-" + id);
        editFormContainer = document.createElement('div');
        editFormContainer.innerHTML = `
        <div class="edit-container mb-2" id="edit-container">
                <form id="edit-form">
                    <input hidden name="comment_id" value="${id}">
                    <div class="col pl-0 " style="font-size: 0.45rem;">
                        <div class=" pr-md-0 pl-0 w-100">
                            <textarea id="edit-input" rows="3" class="form-control mr-0 text-justify" 
                                >${objectBody.innerText}</textarea>
                        </div>
                        <div class=" px-md-0 py-2 comment-button">
                            <button type="submit" class="btn btn-md btn-dark" id ="send-edit-btn"> Save Changes </button>
                        </div>
                    </div>
                </form>
        </div>`;

        // console.log(content);
        currentContent = objectBody.innerText;
        content.appendChild(editFormContainer);
        let editForm = document.querySelector("#edit-form");
        if (editForm != null) {
            editForm.addEventListener('submit', function (event) {
                event.preventDefault();
                event.stopPropagation();
                sendCommentEdit();
            });
        }
        objectBody.remove();
        //  content.remove(postBody);

        // let editInput = document.getElementById("edit-input-" + id);
        // editInput.addEventListener('blur', () => { editFormContainer.remove(); });
    }
}

function addEditPostForm(item) {
    let id = item.getAttribute('data-post-id');
    let editPostFormContainer = document.getElementById("edit-post-container");
    if (editPostFormContainer == null) {
        let content = document.getElementById("post-content-container-" + id);
        let objectBody = document.getElementById("post-body-" + id);
        editPostFormContainer = document.createElement('div');
        editPostFormContainer.innerHTML = `
        <div class="edit-container mb-2" id="edit-post-container">
                <form id="edit-post-form">
                    <input hidden name="post_id" value="${id}">
                    <div class="col pl-0 " style="font-size: 0.45rem;">
                        <div class=" pr-md-0 pl-0 w-100">
                            <textarea id="edit-post-input" rows="8" class="form-control mr-0 text-justify" 
                                >${objectBody.innerText}</textarea>
                        </div>
                        <div class=" px-md-0 py-2 comment-button">
                            <button type="submit" class="btn btn-md btn-dark" id ="send-edit-btn"> Save Changes </button>
                        </div>
                    </div>
                </form>
        </div>`;

        // console.log(content);
        currentContent = objectBody.innerText;
        content.appendChild(editPostFormContainer);
        let editPostForm = document.querySelector("#edit-post-form");
        if (editPostForm != null) {
            editPostForm.addEventListener('submit', function (event) {
                event.preventDefault();
                event.stopPropagation();
                sendPostEdit();
            });
        }
        objectBody.remove();
        //  content.remove(postBody);

        // let editInput = document.getElementById("edit-input-" + id);
        // editInput.addEventListener('blur', () => { editFormContainer.remove(); });
    }
}

function removeEditPostForm() {
    let editPostFormContainer = document.getElementById("edit-post-container");
    if (editPostFormContainer != null) {
        let id = document.querySelector("input[name=post_id]").value;
        let objectBody = document.createElement('p');
        objectBody.classList.add("card-text");
        objectBody.setAttribute("style", "white-space: pre-line");
        objectBody.classList.add("pb-5");
        objectBody.setAttribute('id', "post-body-" + id);
        objectBody.innerText = currentContent;
        let postContainer = document.getElementById("post-content-container-" + id);
        // console.log(objectBody);
        postContainer.appendChild(objectBody);
        editPostFormContainer.remove();
        //  content.remove(postBody);

        // let editInput = document.getElementById("edit-input-" + id);
        // editInput.addEventListener('blur', () => { editFormContainer.remove(); });
    }
}

function removeEditCommentForm() {
    let editFormContainer = document.getElementById("edit-container");
    if (editFormContainer != null) {
        let id = document.querySelector("input[name=comment_id]").value;
        let objectBody = document.createElement('p');
        objectBody.classList.add("card-text");
        objectBody.setAttribute("style", "white-space: pre-line");
        objectBody.setAttribute('id', "comment-body-" + id);
        objectBody.innerText = currentContent;
        let commentContainer = document.getElementById("comment-content-container-" + id);
        // console.log(objectBody);
        commentContainer.appendChild(objectBody);
        editFormContainer.remove();
        //  content.remove(postBody);

        // let editInput = document.getElementById("edit-input-" + id);
        // editInput.addEventListener('blur', () => { editFormContainer.remove(); });
    }
}

function openDeleteConfirmModal(item) {
    let type = item.getAttribute("data-type");
    // console.log(type);
    let target = item.getAttribute("data-object");
    // console.log(target);
    let route = item.getAttribute("data-route");
    // console.log(route);
    let modal = null;
    if (type == "comment") {
        // console.log("comment");
        modal = document.getElementById("confirm-delete-comment");
        // console.log(modal);
    } else if (type == "post") {
        // console.log("post");
        modal = document.getElementById("confirm-delete-post");
    }

    modal.setAttribute("data-target", target);
    modal.setAttribute("data-route", route);
    // console.log("ROTA :" + modal.getAttribute("data-route"));

    addDeleteConfirmButtonsListener();
}

function sendDeleteConfirmObject(item) {
    // console.log("send delete");
    let id = item.getAttribute('data-target');
    // console.log(id);
    let pattern = /\/post\/[0-9]+/i;
    // console.log(pattern);
    let route = item.getAttribute('data-route');
    // console.log(item);
    let argumentsObject = null;
    let handlerFunction = null;

    if (route.match(pattern)) {
        argumentsObject = {};
        sendAjaxRequest("delete", route, argumentsObject, deletePostHandler);
    } else {
        argumentsObject = { comment_id: id };
        comment = document.getElementById("comment" + id);
        // console.log("ID is *" + id + "*");
        // console.log(comment);
        sendAjaxRequest("delete", route, argumentsObject, deleteCommentHandler(id));
    }

    $('#modalDeleteComment').modal('hide');
    $('#modalDeletePost').modal('hide');

}

function sendCommentReply() {
    let user_id = document.querySelector('input[name=user_id]').value;
    let post_id = document.querySelector('input[name=post_id]').value;
    let comment_id = document.querySelector('input[name=comment_id]').value;
    let replyBody = document.getElementById("reply-input").value;
    let targetComment = document.getElementById(comment_id);

    sendAjaxRequest('post', '/reply', {
        user_id: user_id,
        post_id: post_id,
        comment_id: comment_id,
        reply: replyBody,
    }, newReplyHandler);

    let replyFormContainer = document.getElementById("reply-container");
    replyFormContainer.remove();
}

function newReplyHandler() {
    // console.log(this.responseText);
    let response = JSON.parse(this.responseText);
    // console.log(response);
    let reply = response['comment'];
    let newComment = document.createElement('div');

    let commentId = reply['id'];
    let commentContent = reply['content'];
    let commentUser = reply['id_author'];
    let commentPost = reply['id_post'];
    let commentParent = reply['id_parent'];
    let commentSection = document.getElementById("replies" + commentParent);
    let authorUsername = response['extras']['author_username'];
    let authorImage = response['extras']['author_photo'];

    if (authorImage.search(/google/) == -1)
        authorImage = "/" + authorImage;

    newComment.setAttribute('id', `comment${commentId}`);
    newComment.setAttribute('class', 'card mb-2 post-container post-reply');
    newComment.innerHTML = `
        <div class="row pt-4">
            <div class="d-flex align-items-end justify-content-end">
                <div class="col">
                    <div class="row">
                        <div class="d-flex justify-content-between pr-1">
                            <a>
                                <i class="fas fa-chevron-up fa-lg pb-2 disabled-voting"></i>
                            </a>
                        </div>
                        <div class="d-flex justify-content-center pb-2">
                            <a>
                                <p class="mb-0"> 0 </p>
                            </a>
                        </div>
                    </div>
                    <div class="row">
                        <div class="d-flex justify-content-between pr-1">
                            <a>
                                <i class="fas fa-chevron-down fa-lg pb-2 disabled-voting"></i>
                            </a>
                        </div>
                        <div class="d-flex justify-content-center">
                            <a>
                                <p> 0 </p>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-md-10 mx-auto" id="comment-content-container-${commentId}">
                <p class="card-text" id="comment-body-${commentId}" style="white-space: pre-line">
                    ${commentContent}
                </p>
            </div>
        </div>

        <div class="card-footer row text-muted p-3"
            style="border-top: 3px solid rgba(76, 25, 27, 0.444); background-color: white;">
            <div class="col-md-6 align-self-center">
                <div class="card-footer-buttons row align-content-center justify-content-start">
                    <a href="" data-target="comment${commentId}" class="reply-btn"><i class="fas fa-reply"></i>Reply</a>
                    <a href="" class="delete-btn" data-toggle="modal" data-target="#modalDeleteComment"
                        data-object="${commentId}" data-route="/comment/${commentId}" data-type="comment">
                        <i class="fas fa-trash-alt"></i>Delete
                    </a>
                    <a href="" class="edit-btn" data-comment-id="${commentId}">
                        <i class="fas fa-eraser"></i>Edit
                    </a>
                </div>
            </div>
            <div class="col-md-6">
                <div class="row align-self-center justify-content-end">
                    <a href="/user/${commentUser}">
                        <img class="profile-pic-small" height="35" width="35" src="${authorImage}" alt="">
                    </a>
                    <span class="px-1 align-self-center">Just now by</span>
                    <a href="/user/${commentUser}" class="my-auto">
                        <span>@</span>${authorUsername}</a>
                </div>
            </div>
        </div>`

    let newCommentReply = document.createElement('div');
    newCommentReply.setAttribute('id', `replies${commentId}`);
    newCommentReply.style.marginLeft = "6%";

    commentSection.insertBefore(newCommentReply, commentSection.childNodes[0]);
    commentSection.insertBefore(newComment, commentSection.childNodes[0]);
    addReplyButtonsListener();
    addEditButtonsListener();
    addDeleteButtonsListener();
}

function sendCommentEdit() {
    let comment_id = document.querySelector('input[name=comment_id]').value;
    let newCommentBody = document.getElementById("edit-input").value;
    // console.log(user_id);
    // console.log(post_id);
    // console.log(comment_id);
    // console.log(replyBody);

    sendAjaxRequest('put', '/comment/' + comment_id, {
        comment_id: comment_id,
        new_content: newCommentBody
    }, newCommentContentHandler);
    let editFormContainer = document.getElementById("edit-container");
    editFormContainer.remove();
}

function sendPostEdit() {
    let post_id = document.querySelector('input[name=post_id]').value;
    let newPostBody = document.getElementById("edit-post-input").value;
    // console.log(user_id);
    // console.log(post_id);
    // console.log(post_id);
    // console.log(replyBody);

    sendAjaxRequest('put', '/post/' + post_id, {
        new_content: newPostBody
    }, newPostContentHandler);
    let editPostFormContainer = document.getElementById("edit-post-container");
    editPostFormContainer.remove();
}

function newCommentContentHandler() {
    let response = JSON.parse(this.responseText);
    // console.log(response);
    let commentId = response['comment_id'];
    let commentContentContainerDiv = document.querySelector("#comment-content-container-" + commentId);
    let commentBody = document.createElement("p");
    commentBody.classList.add("card-text");
    commentBody.id = "comment-body-" + commentId;
    commentContentContainerDiv.appendChild(commentBody);
    commentBody.innerText = response['new_content'];
    /*
    <div class="col-md-10 mx-auto" id="comment-content-container-{{$comment->id}}">
        <p class="card-text" id="comment-body-{{$comment->id}}">
            {{$comment->content}}
        </p>
    </div>
    */
}

function newPostContentHandler() {
    let response = JSON.parse(this.responseText);
    // console.log(response);
    let postId = response['post_id'];
    let postContentContainerDiv = document.querySelector("#post-content-container-" + postId);
    let postBody = document.createElement("p");
    postBody.classList.add("card-text");
    postBody.id = "post-body-" + postId;
    postContentContainerDiv.appendChild(postBody);
    postBody.innerText = response['new_content'];
    /*
    <div class="col-md-10 mx-auto" id="comment-content-container-{{$comment->id}}">
        <p class="card-text" id="comment-body-{{$comment->id}}">
            {{$comment->content}}
        </p>
    </div>
    */
}

function deleteCommentHandler(id) {
    // console.log("ID:" + id);
    let replies = document.querySelector('#replies' + id);

    let parentComment = replies.parentNode;
    let siblingComment = document.querySelector('#comment' + id);

    if (parentComment.id == "post-comment-section" || parentComment.parentNode.id == "post-comment-section") {
        parentComment.style.marginLeft = "0px";
    }

    siblingComment.classList.remove("mb-2");
    siblingComment.classList.add("mx-0", "px-0");

    if (replies != null) {
        replies.remove();
    }

    if (comment != null) {
        comment.classList.forEach((commentClass) => {
            comment.classList.remove(commentClass);
        });

        comment.innerHTML = `
                <div class=" alert alert-success mt-4">
                    <div class="my-0">
                        <p class="my-0">Your comment and its replies were deleted successfuly!</p>
                    </div>
                </div>`
        window.clearTimeout(timeoutHandlerCommentDelete);
        timeoutHandlerCommentDelete = setTimeout(function () {
            comment.outerHTML = ``;
        }, 1500);
    }

    // let content = document.querySelector("#"+item.id+" p[class='card-text']");
    // console.dir(content);
    // let modal = document.getElementById("#modalDeleteComment");
    // content.classList.add("alert-danger")
    // content.innerHTML ="Your comment was deleted";
}

function deletePostHandler() {
    // console.log("RESPOSTA " + this.responseText);
    if (this.status == 200) {
        // console.log("200 OK!" + this.status);
        window.location = '/';

        let feedbackMessage = document.querySelector('#feedback-message-home');

        if (feedbackMessage != null)
            feedbackMessage.innerHTML = `
                <div class="alert alert-success">
                    <div class="my-auto">
                        <p class="my-0">Your post deleted successfuly!</p>
                    </div>
                </div>`

        window.clearTimeout(timeoutHandlerPostDelete);
        timeoutHandlerPostDelete = setTimeout(function () {
            feedbackMessage.innerHTML = ``
        }, 2500);
    }
    else {
        // console.log(this.status);
        // window.location = '/';
        alert("Something went wrong!");
    }
}


function communityCheckedHandler() {
    // if (this.status != 200) window.location = '/';
    allCommunities = JSON.parse(this.responseText);
}

function searching(word) {
    return allCommunities.filter(community => {
        let regex = new RegExp(word, 'gi');
        return community.name.match(regex);
    });
}

function searchArray() {
    if (input.value.length < 2) {
        search.classList.remove('show');
        return;
    }

    sendAjaxRequest('post', '/api/communities', '', communityCheckedHandler);

    matches = searching(input.value);
    // console.log(matches);

    let html;

    if (matches.length == 0) {
        search.classList.remove('show');
        html = ``;
    }

    html = matches.map(match => {
        search.classList.add('show');
        return `
            <div class="notification-item search-result py-0">
                <div class="row">
                    <div class="col-4 text-center pr-0">
                        <a href="">
                            <img class="notification-pic" id="login" height="40" width="40"
                                src="${match.image}"
                                alt="Profile Image"></a>
                    </div>
                    <div class="col-6 p-0 my-auto">
                        <h6 class="item-info mb-0">${match.name}</h6>
                    </div>
                </div>
            </div>

            <hr class="my-0" style="width: 80%;">
            `;
    }).join('');

    search.innerHTML = html;
    clickSearchResult();
}

function clickSearchResult() {
    let search_results = document.querySelectorAll('.search-result');
    if (search_results.length != 0) {
        search_results.forEach((search_result) => {
            if (search_result != null) {
                search_result.addEventListener('click', function () {
                    input.value = search_result.getElementsByClassName("item-info")[0].innerHTML;
                    search.classList.remove('show');
                    privacy.style.visibility = 'hidden';
                })
            }
        });
    }
}

if (input != null) {
    input.addEventListener('click', searchArray);
    input.addEventListener('keyup', function () {
        searchArray();
        privacy.style.visibility = 'visible';
    });
}

document.addEventListener("click", function () {
    if (search != null)
        search.classList.remove('show');
});

let newPostForm = document.querySelector('#new-post-form');
let newPostPrivacyToggle = document.querySelector('#new-post-form #communityPrivacyToggle');
let newPostPrivacyToggleLabel = document.querySelector('#new-post-form label[for="communityPrivacyToggle"]');

if (newPostForm != null) {
    newPostForm.reset()
    if (newPostPrivacyToggle.hasAttribute('checked')) {
        newPostPrivacyToggleLabel.innerHTML = "Private Account";
    } else {
        newPostPrivacyToggleLabel.innerHTML = "Public Account";
    }
}

let typeTab = 'home';
let lock = false;
let num_posts = 15;
let loader = document.getElementById("loader");
let no_content = document.getElementById("no-content");
$(document).ready(function () {
    let posts_column_home = document.getElementById("posts-column-home");
    let posts_column_community = document.getElementById("posts-column-community");
    let page;
    let api_route;
    let data_route;

    // if (no_content != null)
    //     no_content.style.display = "block";

    if (posts_column_home != null || posts_column_community != null) {
        // if (posts_column_community != null && posts_column_community.children.length != 0) {
        //     no_content.style.display = "none";
        // }

        // if (posts_column_home != null && posts_column_home.children.length != 0) {
        //     no_content.style.display = "none";
        // }

        lock = false;
        loader.style.display = 'none';

        $(window).scroll(function () {
            if ($(window).scrollTop() + $(window).height() > $(document).height() - 200) {
                if (posts_column_home != null) {
                    api_route = '/api/home';
                    page = "#posts-column-home";
                    data_route = { num_posts: num_posts, type: typeTab };
                } else if (posts_column_community != null) {
                    api_route = '/api/community';
                    page = "#posts-column-community";
                    data_route = { num_posts: num_posts, type: typeTab, community_id: document.querySelector('.community-page-container').getAttribute('data-object-id') };
                }

                if (lock == true)
                    return;

                loader.style.display = 'block';
                lock = true;

                $.ajax({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    url: api_route,
                    type: 'POST',
                    dataType: 'json',
                    data: data_route,
                    success: function (data) {
                        if (data.html.length == 0) {
                            lock = true;
                            loader.style.display = 'none';
                            return;
                        }

                        refreshPostHandler(data, page);
                        lock = false;
                        num_posts += 5;
                        loader.style.display = 'none';
                    }
                });
            }
        });
    }
});

function refreshPostHandler(response, page) {
    if (response.success === true) {
        $(page).append(response.html).fadeIn("slow");
        addPostEventListeners();
    }
}

let home_aside = document.querySelectorAll(".home-aside");
if (home_aside.length != 0) {
    let homes_menu = document.getElementById("home_menu");
    let populars_menu = document.getElementById("popular_menu");
    let recents_menu = document.getElementById("recent_menu");

    function home_tabs() {
        $("#posts-column-home").length ? $('#posts-column-home').html("") : $('#posts-column-community').html("");
        loader.style.display = 'block';
        no_content.style.display = "none";
        tab_content("home");
        typeTab = 'home';
        lock = false;
        num_posts = 15;

        populars_menu.classList.remove("nav-border-active");
        populars_menu.classList.add("nav-border");
        populars_menu.addEventListener("click", popular_tabs);

        if (recents_menu != null) {
            recents_menu.classList.remove("nav-border-active");
            recents_menu.classList.add("nav-border");
            recents_menu.addEventListener("click", recent_tabs);
        }

        homes_menu.classList.remove("nav-border");
        homes_menu.classList.add("nav-border-active");
        homes_menu.removeEventListener("click", home_tabs);
    }

    function popular_tabs() {
        $("#posts-column-home").length ? $('#posts-column-home').html("") : $('#posts-column-community').html("");
        loader.style.display = 'block';
        no_content.style.display = "none";
        tab_content("popular");
        typeTab = 'popular';
        lock = false;
        num_posts = 15;

        homes_menu.classList.remove("nav-border-active");
        homes_menu.classList.add("nav-border");
        homes_menu.addEventListener("click", home_tabs);

        if (recents_menu != null) {
            recents_menu.classList.remove("nav-border-active");
            recents_menu.classList.add("nav-border");
            recents_menu.addEventListener("click", recent_tabs);
        }

        populars_menu.classList.remove("nav-border");
        populars_menu.classList.add("nav-border-active");
        populars_menu.removeEventListener("click", popular_tabs);
    }

    function recent_tabs() {
        $('#posts-column-home').html("");
        loader.style.display = 'block';
        no_content.style.display = "none";
        tab_content("recent");
        typeTab = 'recent';
        lock = false;
        num_posts = 15;

        homes_menu.classList.remove("nav-border-active");
        homes_menu.classList.add("nav-border");
        homes_menu.addEventListener("click", home_tabs);

        populars_menu.classList.remove("nav-border-active");
        populars_menu.classList.add("nav-border");
        populars_menu.addEventListener("click", popular_tabs);

        recents_menu.classList.remove("nav-border");
        recents_menu.classList.add("nav-border-active");
        recents_menu.removeEventListener("click", recent_tabs);
    }

    // homes_menu.addEventListener("click", home_tabs);
    populars_menu.addEventListener("click", popular_tabs);
    if (recents_menu != null)
        recents_menu.addEventListener("click", recent_tabs);

}

function tab_content(type) {
    let url, community_id;
    $("#posts-column-home").length ? url = '/api/' + type + 'Tab' : url = '/api/' + type + 'TabCom';
    $("#posts-column-home").length ? community_id = {} : community_id = document.querySelector('.community-page-container').getAttribute('data-object-id');

    $.ajax({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        url: url,
        type: 'POST',
        dataType: 'json',
        data: { community_id },
        success: function (data) {
            loader.style.display = 'none';
            if (data.html.length == 0) {
                no_content.style.display = "block";
                return;
            } else {
                no_content.style.display = "none";
            }

            tabPostHandler(data);
        }
    });
}

function tabPostHandler(response) {
    if (response.success === true) {
        let page;
        $("#posts-column-home").length ? page = '#posts-column-home' : page = '#posts-column-community';
        $(page).html(response.html).fadeIn("slow");

        addPostEventListeners();
    }
}

addPostEventListeners();

(function () {
    'use strict';
    window.addEventListener('load', function () {
        let forms = document.getElementsByClassName('needs-validation');
        let validateGroup = document.getElementsByClassName('validate-me');

        let validation = Array.prototype.filter.call(forms, function (form) {
            form.addEventListener('submit', function (event) {
                if (form.checkValidity() === false) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                for (let i = 0; i < validateGroup.length; i++) {
                    validateGroup[i].classList.add('was-validated');
                }
            }, false);
        });
    }, false);
})();

$(document).mouseup(function (e) {
    if ($(e.target).closest("#reply-container").length
        == 0) {
        $("#reply-container").remove();
    }
    if ($(e.target).closest("#edit-container").length
        == 0) {
        removeEditCommentForm();
        // $("#edit-container").remove();
    }
    if ($(e.target).closest("#edit-post-container").length
        == 0) {
        removeEditPostForm()
        // $("#edit-post-container").remove();
    }
});

function postFading() {
    let posts = document.querySelectorAll('.post-box');
    if (posts.length != 0) {
        let height;
        let readMore;
        posts.forEach((post) => {
            height = post.clientHeight;
            readMore = post.querySelector('.read-more');
            if (height < 260) {
                readMore.style.padding = 0;
            }
        });
    }
}