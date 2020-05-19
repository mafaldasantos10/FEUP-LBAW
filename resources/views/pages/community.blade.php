@extends('layouts.app', ['title' => $community->name ." | Community"])
@section('content')

<!-- Page Content -->
<div class="container community-page-container" data-object-id="{{$community->id}}">
    <div class="row">

        <!-- Aside -->

        <div class="col-md-3 mt-3 aside">
            <!-- My Categories -->
            <div class="card aside-container sticky-top">
                <h5 class="card-header aside-container-top"
                    style="border: 1px solid rgba(76, 25, 27); border-radius: 2px; background-color: rgb(76, 25, 27);">
                </h5>
                <div class="card-body">
                    <div class="row">
                        <div class="col justify-content-start">
                            <a href="#">
                                <div class="nav-border-active">
                                    Home
                                </div>
                            </a>
                            <a href="#">
                                <div class="nav-border">Popular</div>
                            </a>
                            <a href="#">
                                <div class="nav-border">Trending</div>
                            </a>
                            <a href="#">
                                <div class="nav-border" style="border-bottom: 0px;">Universities</div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {{-- //Admin
        <div class="col-md-3 aside" style="padding-top: 20px;">

            <!-- My Categories -->
            <div class="card aside-container sticky-top">
                <h5 class="card-header aside-container-top"
                    style="border: 1px solid rgba(76, 25, 27); border-radius: 2px; background-color: rgb(76, 25, 27);">
                </h5>
                <div class="card-body">
                    <div class="row">
                        <div class="col justify-content-start">
                            <div id="all_menu" class="admin-aside nav-border-active">All</div>
                            <div id="users_menu" class="admin-aside nav-border">Users</div>
                            <div id="comments_menu" class="admin-aside nav-border">Comments</div>
                            <div id="posts_menu" class="admin-aside nav-border">Posts</div>
                            <div id="communities_menu" class="admin-aside nav-border" style="border-bottom: 0px;">
                                Communities</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        --}}

        <!-- Posts Column -->
        <div class="col-md-9">

            <div class="row my-auto">
                <div class="col-md-2 text-center community-pic-container-comm">
                    <img class="community-pic" src="{{ asset($community->image)}}" alt="Community Image">
                </div>

                <div class="col-md-7 my-auto">
                    <h1 class="my-0">{{$community->name}}</h1>
                </div>
                <div class="col-md-1 text-center d-flex align-items-center">
                    <input type="button" class="btn btn-dark" value="Join">
                </div>
                <div class="col-md-2 text-center d-flex align-items-center">
                    <input type="button" data-toggle="modal" data-dismiss="modal" data-target="#modalCommunityReport"
                        class="btn btn-outline-danger" value="Report">
                </div>
                {{-- Admin
                <div class="col-md-8">
                    <h1 class="my-4">/Porto</h1>
                </div>
                <div class="col-md-1 d-flex align-items-center justify-self-right">
                    <input type="button" class="btn btn-outline-danger" value="Delete">
                </div>
                 --}}
            </div>

            @if (Auth::check())
            <!-- New Post -->
            <a href="{{ route('new_post')}}">
                <div class="mt-4 mt-md-1 card mb-4 mr-md-2 mr-lg-4 post-container">
                    <div class="card-body">
                        <div class="row" style="font-size: 0.45rem;">
                            <div class="col">
                                <input type="text" class="form-control" placeholder="Write your own post">
                            </div>
                            <div class="col-1 pl-0 my-auto">
                                <i class="fas fa-plus-circle fa-4x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </a>
            @endif
            {{-- @each('partials.homePost', $posts, 'post') --}}

            <div id="posts-column-community">
                @foreach($posts as $post)
                @include('partials.homePost', ['post'=>$post, 'user'=>$user])
                @endforeach
            </div>

            <div class="d-flex justify-content-center col-md-11 mt-2">
                <div id="loader" class="spinner-border text-secondary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
            <!-- Post -->
            {{--  home_post($auth, "someusername", "myProfile.php", "./images/avatar_male.png", "/Porto", "March 5, 2020", 12, 2, "https://s31450.pcdn.co/wp-content/uploads/2017/08/iStock-157735020-170828.jpg", "Problem with studying.", "Hello i am desperately trying to find a way
                                        to learn how to learn. I am in the first semester of my CS uni and i just realised that i dont know how to start learning a new course. I tried reading the provided book / searching on
                                        internet but when it comes to the homework i dont know a single thing...So please if you have any umm i dont know tip or how to it would be nice. <br>
                                        Thank you.", $admin); 

            <!-- Post -->
            home_post($auth, "someusername", "myProfile.php", "./images/avatar_male.png", "/Porto", "March 5, 2020", 12, 2, "https://cdn.thecollegeinvestor.com/wp-content/uploads/2018/03/WP_FORGIVE.jpg", "Financial help", "So I have had some offers from my university so now I'm
                                        looking at financing and asked my parents if they would help with living costs so I could focus on  my studies. What do I do. Will a part time job be able to support all of my living costs?", $admin); 

            <!-- Post -->
            home_post($auth, "someusername", "myProfile.php", "./images/avatar_male.png", "/Porto", "March 5, 2020", 15, 2, "https://image.freepik.com/free-photo/vintage-typewriter-header-retro-machine-technology_1484-1355.jpg", "What editor do you people use for papers?", "Preferably free or a cheap fee but as I write my analysis
                                        essay, I was
                                        wondering if there are good tools for editing papers? If so, which do you use?", $admin) 

            <!-- Post -->
            home_post($auth, "someusername", "myProfile.php", "./images/avatar_male.png", "/Porto", "March 5, 2020", 12, 2, "https://static.wixstatic.com/media/969f6d_76c95d0987e2442799573d290138b124~mv2.jpg", "University acceptance", "I just got accepted to UMass Amherst as an international
                                        undergraduate(freshman for engn). Any tips that might help me start well my year ?", $admin)  --}}
        </div>
    </div>
</div>

@endsection